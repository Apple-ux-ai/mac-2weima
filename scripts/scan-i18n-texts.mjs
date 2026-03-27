import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const TARGET_DIRS = ['src', 'public', 'electron']
const EXTENSIONS = new Set(['.vue', '.js', '.ts', '.html', '.cjs', '.mjs'])
const IGNORE_PATH_PARTS = [
  'src/i18n/messages/',
  'src/i18n/localeMap.js',
  'public/i18n/core.js'
]

const FILE_PATTERNS = [
  { name: 'templateText', regex: />\s*[\u4e00-\u9fff][^<]*</g },
  { name: 'placeholder', regex: /placeholder\s*=\s*["'][^"']*[\u4e00-\u9fff][^"']*["']/g },
  { name: 'titleAttr', regex: /title\s*=\s*["'][^"']*[\u4e00-\u9fff][^"']*["']/g },
  { name: 'alertConfirm', regex: /\b(alert|confirm|prompt)\s*\(\s*([`'"])([\s\S]*?[\u4e00-\u9fff][\s\S]*?)\2\s*\)/g },
  { name: 'localeHardcode', regex: /toLocaleString\s*\(\s*['"]zh-CN['"]/g }
]

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(abs, out)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (EXTENSIONS.has(ext)) out.push(abs)
  }
  return out
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  if (IGNORE_PATH_PARTS.some((part) => rel.includes(part))) {
    return { file: rel, findings: [] }
  }
  const findings = []

  for (const pattern of FILE_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    let match
    while ((match = regex.exec(content)) !== null) {
      const idx = match.index
      const line = content.slice(0, idx).split('\n').length
      const snippet = String(match[0]).replace(/\s+/g, ' ').slice(0, 120)
      findings.push({ type: pattern.name, line, snippet })
    }
  }

  return { file: rel, findings }
}

function main() {
  const files = TARGET_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
  const report = []
  for (const file of files) {
    const result = scanFile(file)
    if (result.findings.length > 0) report.push(result)
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    scannedFiles: files.length,
    matchedFiles: report.length,
    totalFindings: report.reduce((n, r) => n + r.findings.length, 0)
  }

  const outDir = path.join(ROOT, 'docs')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'i18n-scan-report.json')
  fs.writeFileSync(outPath, JSON.stringify({ summary, report }, null, 2), 'utf8')

  const topFiles = report
    .map((r) => ({ file: r.file, count: r.findings.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  console.log('[i18n-scan] report:', outPath)
  console.log('[i18n-scan] summary:', summary)
  console.log('[i18n-scan] top files:')
  for (const item of topFiles) {
    console.log(`  - ${item.file}: ${item.count}`)
  }
}

main()

