import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  // Το `open` μένει κλειστό επίτηδες: σε συστήματα χωρίς προεπιλεγμένο
  // browser handler το Vite τυπώνει ένα κόκκινο «spawn xdg-open ENOENT»
  // που μοιάζει με κρασάρισμα ενώ ο server τρέχει κανονικά.
  server: { port: 5180, strictPort: false },
  preview: { port: 5180, strictPort: false },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 },
  // Το tesseract.js είναι CommonJS — αφήνουμε το Vite να το προ-δεσμεύσει.
  optimizeDeps: { include: ['tesseract.js'] },
})
