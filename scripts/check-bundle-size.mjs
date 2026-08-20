import { gzipSync } from 'node:zlib'
import { readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = resolve(projectRoot, 'apps/web/dist')
const indexPath = resolve(distDirectory, 'index.html')
const budget = Number.parseInt(process.env.BUNDLE_BUDGET_GZIP_BYTES ?? '290221', 10)

if (!Number.isFinite(budget) || budget <= 0) {
  throw new Error('BUNDLE_BUDGET_GZIP_BYTES doit être un entier strictement positif.')
}

const indexHtml = readFileSync(indexPath, 'utf8')
const scriptPaths = [...indexHtml.matchAll(/\bsrc=["']([^"']+\.js)["']/g)].map((match) => match[1])

if (scriptPaths.length === 0) {
  throw new Error(`Aucun script JavaScript d'entrée trouvé dans ${indexPath}.`)
}

const assets = scriptPaths.map((scriptPath) => {
  const assetPath = resolve(distDirectory, scriptPath.replace(/^\//, ''))
  const rawBytes = statSync(assetPath).size
  const gzipBytes = gzipSync(readFileSync(assetPath), { level: 9 }).length

  return { assetPath, rawBytes, gzipBytes }
})

const totalRawBytes = assets.reduce((total, asset) => total + asset.rawBytes, 0)
const totalGzipBytes = assets.reduce((total, asset) => total + asset.gzipBytes, 0)
const formatKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`

for (const asset of assets) {
  console.log(
    `${asset.assetPath}: ${asset.rawBytes} octets brut, ${asset.gzipBytes} octets gzip`,
  )
}

console.log(`JavaScript initial : ${formatKiB(totalGzipBytes)} gzip`)
console.log(`Budget : ${formatKiB(budget)} gzip`)

if (totalGzipBytes >= budget) {
  throw new Error(
    `Budget JavaScript dépassé : ${totalGzipBytes} octets gzip, seuil strict ${budget} octets.`,
  )
}

console.log('Budget JavaScript respecté.')
