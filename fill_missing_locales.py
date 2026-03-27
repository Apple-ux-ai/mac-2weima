#!/usr/bin/env python3
"""
Fill missing locale keys only (lowest cost).

- Uses zh_CN.json (or any source) as the complete baseline.
- For each target locale file, only translates keys that are missing.
- Merges translated keys back into existing locale JSON without overwriting existing values.

This avoids re-translating the full file and saves quota.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Tuple
from urllib import error, request


LANGUAGE_NAMES: Dict[str, str] = {
    "ar": "Arabic",
    "bn": "Bengali",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fa": "Farsi (Persian)",
    "fr": "French",
    "he": "Hebrew",
    "hi": "Hindi",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "ms": "Malay",
    "nl": "Dutch",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt_BR": "Brazilian Portuguese",
    "ru": "Russian",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh_CN": "Simplified Chinese",
    "zh_TW": "Traditional Chinese",
}

PLACEHOLDER_RE = re.compile(r"\{\{\s*[^{}]+\s*\}\}")


def flatten_object(obj: dict, prefix: str = "", acc: Dict[str, str] | None = None) -> Dict[str, str]:
    if acc is None:
        acc = {}
    for key, value in obj.items():
        path_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flatten_object(value, path_key, acc)
            continue
        if not isinstance(value, str):
            # Non-string leaf nodes are ignored for translation; keep behavior consistent with existing translator.
            continue
        acc[path_key] = value
    return acc


def unflatten_object(flat: Dict[str, str]) -> dict:
    result: dict = {}
    for path_key, value in flat.items():
        keys = path_key.split(".")
        cursor = result
        for part in keys[:-1]:
            if part not in cursor or not isinstance(cursor[part], dict):
                cursor[part] = {}
            cursor = cursor[part]
        cursor[keys[-1]] = value
    return result


def sorted_placeholders(text: str) -> List[str]:
    return sorted(PLACEHOLDER_RE.findall(text))


def same_placeholders(source: str, translated: str) -> bool:
    return sorted_placeholders(source) == sorted_placeholders(translated)


def sanitize_json_text(raw: str) -> str:
    trimmed = raw.strip()
    fenced = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", trimmed, re.IGNORECASE)
    content = fenced.group(1) if fenced else trimmed
    first_brace = content.find("{")
    last_brace = content.rfind("}")
    if first_brace < 0 or last_brace < 0 or last_brace <= first_brace:
        raise ValueError("Model response does not contain a valid JSON object.")
    return content[first_brace : last_brace + 1]


def parse_langs(langs_raw: str) -> List[str]:
    langs = [x.strip() for x in langs_raw.split(",") if x.strip()]
    if not langs:
        raise ValueError("--langs cannot be empty")
    return langs


def chunk_entries(entries: List[Tuple[str, str]], size: int) -> List[List[Tuple[str, str]]]:
    return [entries[i : i + size] for i in range(0, len(entries), size)]


def request_chat_completion(
    *,
    base_url: str,
    api_key: str,
    model: str,
    messages: List[dict],
    temperature: float,
    timeout_sec: int,
) -> str:
    endpoint = f"{base_url.rstrip('/')}/chat/completions"
    payload = json.dumps(
        {
            "model": model,
            "temperature": temperature,
            "messages": messages,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = request.Request(
        endpoint,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with request.urlopen(req, timeout=timeout_sec) as resp:
        body = resp.read().decode("utf-8")
    data = json.loads(body)
    content = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("Translation API response is missing message content.")
    return content


def call_with_retry(fn, retries: int, retry_backoff_sec: float):
    last_err: Exception | None = None
    for attempt in range(retries + 1):
        try:
            return fn()
        except Exception as err:  # noqa: BLE001
            last_err = err
            if attempt >= retries:
                break
            time.sleep((attempt + 1) * retry_backoff_sec)
    assert last_err is not None
    raise last_err


def translate_chunk_by_order(
    *,
    lang: str,
    chunk_object: Dict[str, str],
    base_url: str,
    api_key: str,
    model: str,
    temperature: float,
    timeout_sec: int,
    retries: int,
    retry_backoff_sec: float,
) -> Dict[str, str]:
    language_name = LANGUAGE_NAMES.get(lang, lang)
    source_keys = list(chunk_object.keys())
    source_values = [chunk_object[k] for k in source_keys]

    system_prompt = " ".join(
        [
            "You are a professional software localization translator.",
            f"Translate UI messages into {language_name}.",
            'Return ONLY one valid JSON object in format {"values":[...]} with exactly the same item count and order as input.',
            "Preserve placeholders exactly, including forms like {{count}} and {{ message }}.",
            r"Preserve escaped newline markers (\n) and markdown/code syntax.",
            "Do not add commentary or code fences.",
        ]
    )
    user_prompt = "\n".join(
        [
            f"Target language code: {lang}",
            "Translate each array item value and keep strict order.",
            "Input values array:",
            json.dumps(source_values, ensure_ascii=False, indent=2),
        ]
    )

    def _do_request():
        content = request_chat_completion(
            base_url=base_url,
            api_key=api_key,
            model=model,
            messages=[{"role": "user", "content": f"{system_prompt}\n\n{user_prompt}"}],
            temperature=temperature,
            timeout_sec=timeout_sec,
        )
        parsed = json.loads(sanitize_json_text(content))
        values = parsed.get("values")
        if not isinstance(values, list) or len(values) != len(source_values):
            raise ValueError(f"Translated array mismatch for {lang}.")
        return values

    values = call_with_retry(_do_request, retries=retries, retry_backoff_sec=retry_backoff_sec)

    mapped: Dict[str, str] = {}
    for i, key in enumerate(source_keys):
        src = source_values[i]
        dst = values[i]
        if isinstance(dst, str) and same_placeholders(src, dst):
            mapped[key] = dst
        else:
            mapped[key] = src
    return mapped


def translate_chunk(
    *,
    lang: str,
    chunk_object: Dict[str, str],
    base_url: str,
    api_key: str,
    model: str,
    temperature: float,
    timeout_sec: int,
    retries: int,
    retry_backoff_sec: float,
) -> Dict[str, str]:
    language_name = LANGUAGE_NAMES.get(lang, lang)
    source_keys = list(chunk_object.keys())

    system_prompt = " ".join(
        [
            "You are a professional software localization translator.",
            f"Translate UI messages into {language_name}.",
            "Return ONLY one valid JSON object with exactly the same keys.",
            "Do not translate any key names.",
            "Preserve placeholders exactly, including forms like {{count}} and {{ message }}.",
            r"Preserve escaped newline markers (\n) and markdown/code syntax.",
            "Do not add commentary or code fences.",
        ]
    )
    user_prompt = "\n".join(
        [
            f"Target language code: {lang}",
            "Translate each JSON value while preserving product terminology consistency.",
            "Input JSON object:",
            json.dumps(chunk_object, ensure_ascii=False, indent=2),
        ]
    )

    def _do_request() -> Dict[str, str]:
        content = request_chat_completion(
            base_url=base_url,
            api_key=api_key,
            model=model,
            messages=[{"role": "user", "content": f"{system_prompt}\n\n{user_prompt}"}],
            temperature=temperature,
            timeout_sec=timeout_sec,
        )
        parsed = json.loads(sanitize_json_text(content))
        translated = flatten_object(parsed)

        if len(translated) != len(source_keys):
            raise ValueError(f"Translated key count mismatch for {lang}.")
        for key in source_keys:
            if key not in translated:
                raise ValueError(f"Translated key missing: {key}")

        mapped: Dict[str, str] = {}
        for key in source_keys:
            src = chunk_object[key]
            dst = translated.get(key)
            if not isinstance(dst, str):
                raise ValueError(f"Translated value is not string at key: {key}")
            if not same_placeholders(src, dst):
                raise ValueError(f"Placeholder mismatch at key: {key}")
            mapped[key] = dst
        return mapped

    try:
        return call_with_retry(_do_request, retries=retries, retry_backoff_sec=retry_backoff_sec)
    except Exception:  # noqa: BLE001
        return translate_chunk_by_order(
            lang=lang,
            chunk_object=chunk_object,
            base_url=base_url,
            api_key=api_key,
            model=model,
            temperature=temperature,
            timeout_sec=timeout_sec,
            retries=retries,
            retry_backoff_sec=retry_backoff_sec,
        )


def fill_one_language(
    *,
    lang: str,
    source_lang_code: str,
    source_flat: Dict[str, str],
    output_dir: Path,
    chunk_size: int,
    base_url: str,
    model: str,
    api_key: str,
    temperature: float,
    timeout_sec: int,
    retries: int,
    retry_backoff_sec: float,
    dry_run: bool,
) -> None:
    output_path = output_dir / f"{lang}.json"
    target_data: dict = {}
    if output_path.exists():
        try:
            target_data = json.loads(output_path.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            target_data = {}

    if lang == source_lang_code:
        if dry_run:
            print(f"[skip] {lang} is source locale")
            return
        output_path.write_text(json.dumps(unflatten_object(source_flat), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"[done] {lang} copied from source language")
        return

    target_flat = flatten_object(target_data)
    missing = [(k, v) for k, v in source_flat.items() if k not in target_flat]

    if not missing:
        print(f"[skip] {lang} no missing keys")
        return

    print(f"[{lang}] missing keys: {len(missing)}")
    if dry_run:
        return

    translated_flat: Dict[str, str] = {}
    chunks = chunk_entries(missing, chunk_size)
    for idx, chunk in enumerate(chunks, start=1):
        chunk_object = dict(chunk)
        translated_chunk = translate_chunk(
            lang=lang,
            chunk_object=chunk_object,
            base_url=base_url,
            api_key=api_key,
            model=model,
            temperature=temperature,
            timeout_sec=timeout_sec,
            retries=retries,
            retry_backoff_sec=retry_backoff_sec,
        )
        translated_flat.update(translated_chunk)
        print(f"[{lang}] chunk {idx}/{len(chunks)} completed")

    # merge: keep existing translations, only add missing
    for k, v in translated_flat.items():
        target_flat[k] = v

    merged_obj = unflatten_object(target_flat)
    output_path.write_text(json.dumps(merged_obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[done] {lang} filled -> {output_path}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Fill missing keys in locale JSONs by translating only missing entries.")
    p.add_argument("--source", required=True, help="Source locale JSON file path (e.g. zh_CN.json)")
    p.add_argument("--output-dir", required=True, help="Output directory containing locale files")
    p.add_argument("--langs", required=True, help="Target language codes, comma separated, e.g. ja,ko,fr")
    p.add_argument("--source-lang-code", default="zh_CN", help="Source language code (default: zh_CN)")
    p.add_argument("--base-url", default=os.getenv("LLM_BASE_URL", os.getenv("DASHSCOPE_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")), help="OpenAI-compatible base URL")
    p.add_argument("--model", default=os.getenv("LLM_MODEL", os.getenv("DASHSCOPE_MODEL", "qwen-mt-plus")), help="Model name")
    p.add_argument("--api-key", default=os.getenv("LLM_API_KEY", os.getenv("DASHSCOPE_API_KEY", os.getenv("OPENAI_API_KEY", ""))), help="API key")
    p.add_argument("--chunk-size", type=int, default=120, help="Missing keys per translation chunk (default: 120)")
    p.add_argument("--concurrency", type=int, default=3, help="Number of language workers (default: 3)")
    p.add_argument("--temperature", type=float, default=0.2, help="Model temperature (default: 0.2)")
    p.add_argument("--timeout-sec", type=int, default=180, help="Request timeout in seconds (default: 180)")
    p.add_argument("--retries", type=int, default=4, help="Retry count on failure (default: 4)")
    p.add_argument("--retry-backoff-sec", type=float, default=2.0, help="Backoff base in seconds (default: 2.0)")
    p.add_argument("--dry-run", action="store_true", help="Only report missing key counts, do not write files")
    return p


def main() -> int:
    args = build_parser().parse_args()

    source_path = Path(args.source).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if not source_path.exists():
        raise FileNotFoundError(f"Source file not found: {source_path}")

    langs = parse_langs(args.langs)
    if args.chunk_size < 1:
        raise ValueError("--chunk-size must be >= 1")
    if args.concurrency < 1:
        raise ValueError("--concurrency must be >= 1")

    source_data = json.loads(source_path.read_text(encoding="utf-8"))
    source_flat = flatten_object(source_data)

    needs_remote = any(lang != args.source_lang_code for lang in langs)
    if needs_remote and not args.api_key and not args.dry_run:
        raise ValueError("Missing API key. Set --api-key or environment variable.")

    print(f"Source keys: {len(source_flat)}")
    print(f"Target languages: {', '.join(langs)}")
    print(f"Model: {args.model}")
    print(f"Base URL: {args.base_url.rstrip('/')}")

    failed: List[Tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=min(args.concurrency, len(langs))) as pool:
        future_map = {
            pool.submit(
                fill_one_language,
                lang=lang,
                source_lang_code=args.source_lang_code,
                source_flat=source_flat,
                output_dir=output_dir,
                chunk_size=args.chunk_size,
                base_url=args.base_url.rstrip("/"),
                model=args.model,
                api_key=args.api_key,
                temperature=args.temperature,
                timeout_sec=args.timeout_sec,
                retries=args.retries,
                retry_backoff_sec=args.retry_backoff_sec,
                dry_run=args.dry_run,
            ): lang
            for lang in langs
        }
        for future in as_completed(future_map):
            lang = future_map[future]
            try:
                future.result()
            except error.HTTPError as err:
                body = err.read().decode("utf-8", errors="ignore")
                msg = f"HTTP {err.code}: {body}"
                failed.append((lang, msg))
                print(f"[fail] {lang}: {msg}", file=sys.stderr)
            except Exception as err:  # noqa: BLE001
                msg = str(err)
                failed.append((lang, msg))
                print(f"[fail] {lang}: {msg}", file=sys.stderr)

    if failed:
        summary = ", ".join([f"{lang}({msg})" for lang, msg in failed])
        raise RuntimeError(f"Some languages failed: {summary}")

    print("Missing key fill completed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as err:  # noqa: BLE001
        print(str(err), file=sys.stderr)
        raise SystemExit(1)

