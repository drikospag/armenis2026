/**
 * Πακετάρει τη μεταγλωττισμένη εφαρμογή σε ΕΝΑ αρχείο HTML, για φιλοξενία
 * όπου δεν μπορούν να σερβιριστούν ξεχωριστά αρχεία.
 *
 * Δεν είναι άλλη εφαρμογή: είναι το ίδιο build (ίδιο React, ίδιος κώδικας),
 * με το CSS και το JS ενσωματωμένα αντί για <link> και <script src>.
 *
 *   npm run build && node scripts/build-artifact.mjs
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const outFile = join(root, 'dist-artifact', 'personal-hub.html')

const html = await readFile(join(dist, 'index.html'), 'utf8')
const assets = await readdir(join(dist, 'assets'))

const entryJs = html.match(/<script type="module"[^>]*src="\.\/assets\/([^"]+)"><\/script>/)?.[1]
const entryCss = html.match(/<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)">/)?.[1]
if (!entryJs || !entryCss) throw new Error('Δεν βρέθηκαν τα assets στο dist/index.html — έτρεξες `npm run build`;')

const js = await readFile(join(dist, 'assets', entryJs), 'utf8')
const css = await readFile(join(dist, 'assets', entryCss), 'utf8')

const lazy = assets.filter((f) => f.endsWith('.js') && f !== entryJs)
if (lazy.length) {
  console.log(`[artifact] Παραλείπονται ${lazy.length} chunk(s) που φορτώνονται κατ' απαίτηση:`)
  console.log(`           ${lazy.join(', ')} — αφορούν το OCR, που δεν τρέχει σε αυτή τη φιλοξενία.`)
}

// Το </script> μέσα σε string του bundle θα έκλεινε πρόωρα το inline script.
const safeJs = js.replace(/<\/script>/gi, '<\\/script>')

const page = `<title>Personal Hub</title>
<style>
${css}
</style>

<div id="root"></div>

<script>
  // Θέμα πριν την πρώτη ζωγραφιά, ώστε να μην αναβοσβήνει.
  try {
    var t = localStorage.getItem('ph.theme')
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t
  } catch (e) {}
  // Σημαία έκδοσης επίδειξης: φορτώνει δείγμα δεδομένων στο πρώτο άνοιγμα.
  window.__PH_DEMO__ = true
</script>
<script type="module">
${safeJs}
</script>
`

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, page, 'utf8')

const kb = (Buffer.byteLength(page) / 1024).toFixed(0)
console.log(`[artifact] OK — ${outFile} (${kb} KB)`)
