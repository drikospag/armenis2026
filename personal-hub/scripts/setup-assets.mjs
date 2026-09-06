/**
 * Αντιγράφει τα assets του Tesseract (worker, wasm core, ελληνικά + αγγλικά
 * traineddata) από το node_modules στο public/tesseract, ώστε η σάρωση
 * αποδείξεων να δουλεύει 100% offline, χωρίς CDN.
 *
 * Τρέχει αυτόματα μετά το `npm install`.
 */
import { cp, mkdir, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'tesseract')
const nm = join(root, 'node_modules')

const copies = [
  [join(nm, 'tesseract.js', 'dist', 'worker.min.js'), join(out, 'worker.min.js')],
  [join(nm, 'tesseract.js-core'), join(out, 'core')],
  [join(nm, '@tesseract.js-data', 'ell', '4.0.0', 'ell.traineddata.gz'), join(out, 'lang', 'ell.traineddata.gz')],
  [join(nm, '@tesseract.js-data', 'eng', '4.0.0', 'eng.traineddata.gz'), join(out, 'lang', 'eng.traineddata.gz')],
]

let copied = 0
let missing = []

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    missing.push(from.replace(nm + '/', ''))
    continue
  }
  await mkdir(dirname(to), { recursive: true })
  await cp(from, to, { recursive: true })
  copied++
}

if (existsSync(join(out, 'core'))) {
  // Κρατάμε μόνο τα builds που ζητά ο browser με OEM.LSTM_ONLY
  // (plain / SIMD / relaxed-SIMD). Τα υπόλοιπα είναι ~32 MB άχρηστου βάρους.
  const keep = /^tesseract-core(-relaxedsimd|-simd)?-lstm\.wasm\.js$/
  for (const f of await readdir(join(out, 'core'))) {
    if (!keep.test(f)) {
      const p = join(out, 'core', f)
      if ((await stat(p)).isFile()) await (await import('node:fs/promises')).rm(p)
    }
  }
}

if (missing.length) {
  console.warn('[setup-assets] Δεν βρέθηκαν:', missing.join(', '))
  console.warn('[setup-assets] Η σάρωση αποδείξεων θα πέσει πίσω σε CDN (χρειάζεται internet).')
} else {
  console.log(`[setup-assets] OK — ${copied} assets OCR αντιγράφηκαν στο public/tesseract (offline έτοιμο).`)
}
