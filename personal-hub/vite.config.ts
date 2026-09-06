import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5180, open: true },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 },
  // Το tesseract.js είναι CommonJS — αφήνουμε το Vite να το προ-δεσμεύσει.
  optimizeDeps: { include: ['tesseract.js'] },
})
