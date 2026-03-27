import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import vm from 'vm'

const ROOT = process.cwd()

const SRC_FILES = [
  'src/App.vue',
  'src/components',
  'src/utils/toast.js',
  'src/modules',
  'src/i18n'
]

const PUBLIC_FILES = [
  'public/viewer.html',
  'public/livecode.html',
  'public/player.html',
  'public/advanced-viewer.html',
  'public/redirect.html',
  'public/toast.js'
]

const VUE_KEY_REGEX = /\b(?:t|tt)\(\s*['"]([^'"]+)['"]/g
const PUBLIC_KEY_REGEX = /(?:PublicI18n\?\.t|(?<![\w$])t)\(\s*['"]([^'"]+)['"]/g

function walkFiles(target, out = []) {
  const abs = path.join(ROOT, target)
  if (!fs.existsSync(abs)) return out
  const stat = fs.statSync(abs)
  if (stat.isFile()) {
    out.push(abs)
    return out
  }
  const entries = fs.readdirSync(abs, { withFileTypes: true })
  for (const entry of entries) {
    const p = path.join(abs, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue
      walkFiles(path.relative(ROOT, p), out)
    } else if (/\.(vue|js|ts|html|cjs|mjs)$/.test(entry.name)) {
      out.push(p)
    }
  }
  return out
}

function extractKeys(files, regex) {
  const keys = new Set()
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/')
    if (rel.startsWith('src/i18n/messages/')) continue
    const content = fs.readFileSync(file, 'utf8')
    let m
    while ((m = regex.exec(content)) !== null) {
      keys.add(m[1])
    }
  }
  return keys
}

function flatten(obj, prefix = '', out = new Set()) {
  if (!obj || typeof obj !== 'object') return out
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, next, out)
    else out.add(next)
  }
  return out
}

function diff(keysUsed, keysDict) {
  return Array.from(keysUsed).filter((k) => !keysDict.has(k)).sort()
}

async function main() {
  const zhPath = path.join(ROOT, 'src/i18n/messages/zh_CN.json')
  const zhData = fs.readFileSync(zhPath, 'utf8')
  const zhMod = { default: JSON.parse(zhData) }
  const enMod = await import(pathToFileURL(path.join(ROOT, 'src/i18n/messages/en.js')).href)
  const zhKeys = flatten(zhMod.default)
  const enKeys = flatten(enMod.default)

  const srcFiles = SRC_FILES.flatMap((x) => walkFiles(x))
  const publicFiles = PUBLIC_FILES.flatMap((x) => walkFiles(x))

  const srcUsed = extractKeys(srcFiles, VUE_KEY_REGEX)
  const publicUsed = extractKeys(publicFiles, PUBLIC_KEY_REGEX)

  const srcMissingZh = diff(srcUsed, zhKeys)
  const srcMissingEn = diff(srcUsed, enKeys)

  const publicCorePath = path.join(ROOT, 'public/i18n/core.js')
  const publicCore = fs.readFileSync(publicCorePath, 'utf8')
  const messagesMatch = publicCore.match(/const messages = (\{[\s\S]*?\n\s*\})\r?\n\r?\n\s*function normalizeLocale/)
  let publicMessages = { zh_CN: {}, en: {} }
  if (messagesMatch) {
    const script = new vm.Script(`(${messagesMatch[1]})`)
    publicMessages = script.runInNewContext({})
  }
  const publicZhKeys = flatten(publicMessages.zh_CN || {})
  const publicEnKeys = flatten(publicMessages.en || {})
  const publicMissingZh = diff(publicUsed, publicZhKeys)
  const publicMissingEn = diff(publicUsed, publicEnKeys)

  const report = {
    generatedAt: new Date().toISOString(),
    src: {
      usedKeyCount: srcUsed.size,
      missingInZhCN: srcMissingZh,
      missingInEn: srcMissingEn
    },
    public: {
      usedKeyCount: publicUsed.size,
      missingInZhCN: publicMissingZh,
      missingInEn: publicMissingEn
    }
  }

  const outPath = path.join(ROOT, 'docs/i18n-missing-report.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')

  console.log('[i18n-missing] report:', outPath)
  console.log('[i18n-missing] src used keys:', srcUsed.size)
  console.log('[i18n-missing] missing zh_CN:', srcMissingZh.length)
  console.log('[i18n-missing] missing en:', srcMissingEn.length)
  console.log('[i18n-missing] public used keys:', publicUsed.size)
  console.log('[i18n-missing] public missing zh_CN:', publicMissingZh.length)
  console.log('[i18n-missing] public missing en:', publicMissingEn.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

