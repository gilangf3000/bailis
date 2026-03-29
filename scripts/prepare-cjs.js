import { mkdirSync, writeFileSync } from 'fs'

const outDir = new URL('../lib/cjs/', import.meta.url)
mkdirSync(outDir, { recursive: true })
writeFileSync(new URL('package.json', outDir), JSON.stringify({ type: 'commonjs' }))
