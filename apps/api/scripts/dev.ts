import { setDefaultResultOrder } from 'node:dns'
import { setDefaultAutoSelectFamily } from 'node:net'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

setDefaultResultOrder('ipv4first')
if (typeof setDefaultAutoSelectFamily === 'function') {
  setDefaultAutoSelectFamily(false)
}

if (existsSync('.env')) {
  loadEnvFile('.env')
}

await import('../src/main.ts')

