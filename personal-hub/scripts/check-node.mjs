/**
 * Ελέγχει ότι η έκδοση του Node είναι αρκετά καινούργια για το Vite,
 * και το λέει με ανθρώπινα λόγια αντί για κρυπτικό stack trace.
 */
const [major, minor] = process.versions.node.split('.').map(Number)
const ok = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 23

if (!ok) {
  const line = '─'.repeat(64)
  console.error(`\n${line}`)
  console.error('  Η έκδοση του Node.js είναι παλιά για αυτή την εφαρμογή.')
  console.error(`\n  Έχεις:      Node ${process.versions.node}`)
  console.error('  Χρειάζεται: Node 20.19+ ή 22.12+ (ιδανικά η τρέχουσα LTS)')
  console.error('\n  Κατέβασε τη νέα έκδοση από https://nodejs.org (κουμπί «LTS»),')
  console.error('  κλείσε και ξανάνοιξε το τερματικό, και ξανατρέξε:')
  console.error('\n      npm install')
  console.error('      npm run dev')
  console.error(`${line}\n`)
  process.exit(1)
}
