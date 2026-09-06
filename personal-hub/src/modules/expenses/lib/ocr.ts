/**
 * OCR αποδείξεων — τρέχει 100% τοπικά στον browser (tesseract.js + WASM).
 * Τα αρχεία γλώσσας (ελληνικά + αγγλικά) αντιγράφονται στο public/tesseract
 * από το `npm install`, οπότε δεν χρειάζεται internet ούτε εξωτερικό API.
 */
import type { Worker } from 'tesseract.js'

export type OcrStage = 'idle' | 'prep' | 'loading' | 'recognizing' | 'done' | 'error'

export interface OcrProgress {
  stage: OcrStage
  /** 0–1 */
  value: number
  message: string
}

const asset = (p: string) => new URL(`tesseract/${p}`, document.baseURI).href

let workerPromise: Promise<Worker> | null = null
let availability: Promise<boolean> | null = null

/**
 * Ελέγχει αν τα αρχεία του OCR σερβίρονται πραγματικά. Επιστρέφει false όταν
 * λείπουν — π.χ. σε φιλοξενία που δεν μπορεί να σερβίρει τα ~25 MB των μοντέλων,
 * ή αν δεν έτρεξε το `npm install`. Έτσι η εφαρμογή το λέει καθαρά στον χρήστη
 * αντί να αποτύχει με σφάλμα αφού διαλέξει φωτογραφία.
 */
export function ocrAvailable(): Promise<boolean> {
  availability ??= (async () => {
    try {
      const res = await fetch(asset('lang/ell.traineddata.gz'), { method: 'HEAD' })
      if (!res.ok) return false
      // Κάποιοι servers απαντούν με τη σελίδα της εφαρμογής αντί για 404.
      return !(res.headers.get('content-type') ?? '').includes('text/html')
    } catch {
      return false
    }
  })()
  return availability
}

async function getWorker(onProgress?: (p: OcrProgress) => void): Promise<Worker> {
  if (workerPromise) return workerPromise
  workerPromise = (async () => {
    const { createWorker, OEM } = await import('tesseract.js')
    return createWorker(['ell', 'eng'], OEM.LSTM_ONLY, {
      workerPath: asset('worker.min.js'),
      corePath: asset('core'),
      langPath: asset('lang'),
      gzip: true,
      cacheMethod: 'none',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.({ stage: 'recognizing', value: m.progress, message: 'Ανάγνωση κειμένου…' })
        } else {
          onProgress?.({ stage: 'loading', value: m.progress, message: 'Φόρτωση μοντέλου OCR…' })
        }
      },
    })
  })().catch((err) => {
    workerPromise = null
    throw err
  })
  return workerPromise
}

/** Ελευθερώνει τον worker (π.χ. όταν κλείνει ο scanner). */
export async function releaseOcr(): Promise<void> {
  const p = workerPromise
  workerPromise = null
  if (p) {
    try { (await p).terminate() } catch { /* ignore */ }
  }
}

/**
 * Προεπεξεργασία εικόνας: περιορισμός μεγέθους, γκρι τόνοι και ενίσχυση
 * αντίθεσης. Οι αποδείξεις είναι χαμηλής αντίθεσης — αυτό ανεβάζει αισθητά
 * την ακρίβεια του OCR.
 */
export async function preprocess(file: Blob, maxDim = 1800): Promise<{ canvas: HTMLCanvasElement; blob: Blob }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data

  // Μέση φωτεινότητα → προσαρμοστική αντίθεση γύρω από αυτήν.
  let sum = 0
  for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
  const mean = sum / (d.length / 4)
  const contrast = 1.7

  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const v = Math.max(0, Math.min(255, (g - mean) * contrast + mean))
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)

  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9))
  return { canvas, blob }
}

/** Τρέχει OCR σε μια εικόνα απόδειξης και επιστρέφει το ακατέργαστο κείμενο. */
export async function scanReceipt(
  file: Blob,
  onProgress?: (p: OcrProgress) => void,
): Promise<{ text: string; confidence: number; processed: Blob }> {
  onProgress?.({ stage: 'prep', value: 0.05, message: 'Προετοιμασία εικόνας…' })
  const { canvas, blob } = await preprocess(file)

  const worker = await getWorker(onProgress)
  onProgress?.({ stage: 'recognizing', value: 0.1, message: 'Ανάγνωση κειμένου…' })

  const { data } = await worker.recognize(canvas)
  onProgress?.({ stage: 'done', value: 1, message: 'Ολοκληρώθηκε' })

  return { text: data.text ?? '', confidence: data.confidence ?? 0, processed: blob }
}
