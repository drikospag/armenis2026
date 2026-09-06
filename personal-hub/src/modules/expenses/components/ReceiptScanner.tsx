import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../../../ui/Icon'
import { money } from '../../../core/format'
import { releaseOcr, scanReceipt } from '../lib/ocr'
import type { OcrProgress } from '../lib/ocr'
import { parseReceipt } from '../lib/receiptParser'
import type { ParsedReceipt } from '../lib/receiptParser'

export interface ScanResult {
  parsed: ParsedReceipt
  text: string
  confidence: number
  /** Η επεξεργασμένη εικόνα, έτοιμη για αποθήκευση. */
  image: Blob
  previewUrl: string
}

/**
 * Σάρωση απόδειξης: επιλογή αρχείου ή φωτογραφία από την κάμερα, OCR τοπικά
 * και ανάγνωση των πεδίων. Δεν αποθηκεύει τίποτα μόνο του — επιστρέφει το
 * αποτέλεσμα στη φόρμα για επιβεβαίωση.
 */
export function ReceiptScanner({ onResult, compact = false }: { onResult: (r: ScanResult) => void; compact?: boolean }) {
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const busy = progress != null && progress.stage !== 'done' && progress.stage !== 'error'

  useEffect(() => () => { void releaseOcr() }, [])

  const handle = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        setError('Διάλεξε αρχείο εικόνας (JPG, PNG, HEIC…).')
        return
      }
      setError(null)
      setProgress({ stage: 'prep', value: 0.02, message: 'Προετοιμασία…' })
      try {
        const { text, confidence, processed } = await scanReceipt(file, setProgress)
        const parsed = parseReceipt(text)
        onResult({
          parsed, text, confidence,
          image: processed,
          previewUrl: URL.createObjectURL(processed),
        })
        setProgress({ stage: 'done', value: 1, message: 'Ολοκληρώθηκε' })
      } catch (err) {
        console.error(err)
        setError('Η σάρωση απέτυχε. Δοκίμασε ξανά ή καταχώρησε το έξοδο χειροκίνητα.')
        setProgress({ stage: 'error', value: 0, message: '' })
      }
    },
    [onResult],
  )

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void handle(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => void handle(e.target.files?.[0])} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void handle(e.dataTransfer.files?.[0]) }}
        style={{
          border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--line-strong)'}`,
          background: dragging ? 'var(--accent-wash)' : 'var(--surface-sunk)',
          borderRadius: 'var(--r)',
          padding: compact ? '14px' : '22px 18px',
          textAlign: 'center',
          transition: 'background .12s ease, border-color .12s ease',
        }}
      >
        {busy ? (
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
              <Icon name="scan" size={18} />
              <span className="small" style={{ fontWeight: 560 }}>{progress?.message}</span>
            </div>
            <div className="progress"><i style={{ width: `${Math.round((progress?.value ?? 0) * 100)}%` }} /></div>
            <div className="small dim">Η ανάγνωση γίνεται τοπικά στον υπολογιστή σου.</div>
          </div>
        ) : (
          <div className="stack" style={{ gap: 10, alignItems: 'center' }}>
            {!compact && <Icon name="receipt" size={30} className="dim" strokeWidth={1.4} />}
            <div className="small" style={{ fontWeight: 560 }}>Σάρωση απόδειξης</div>
            {!compact && (
              <div className="small dim" style={{ maxWidth: 340 }}>
                Σύρε τη φωτογραφία εδώ ή διάλεξε αρχείο. Τα πεδία συμπληρώνονται αυτόματα και τα επιβεβαιώνεις.
              </div>
            )}
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>
                <Icon name="image" size={15} /> Αρχείο
              </button>
              <button type="button" className="btn btn-sm" onClick={() => cameraRef.current?.click()}>
                <Icon name="scan" size={15} /> Φωτογραφία
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="row small" style={{ gap: 6, marginTop: 8, color: 'var(--critical)' }}>
          <Icon name="alert" size={15} /> {error}
        </div>
      )}
    </div>
  )
}

/** Σύνοψη όσων διάβασε το OCR, με δυνατότητα διόρθωσης του ποσού με ένα κλικ. */
export function ScanSummary({ result, onPickAmount }: { result: ScanResult; onPickAmount: (v: number) => void }) {
  const { parsed, confidence } = result
  const [showText, setShowText] = useState(false)
  const others = parsed.amounts.filter((a) => a !== parsed.total).slice(0, 5)

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row small" style={{ gap: 8 }}>
        <span className="badge">
          <Icon name="sparkles" size={13} /> Ακρίβεια OCR {Math.round(confidence)}%
        </span>
        {!parsed.confident.total && parsed.total != null && (
          <span className="badge" style={{ color: 'var(--serious)' }}>
            <Icon name="alert" size={13} /> Έλεγξε το ποσό
          </span>
        )}
      </div>

      {others.length > 0 && (
        <div>
          <div className="small dim" style={{ marginBottom: 5 }}>Άλλα ποσά στην απόδειξη — πάτησε για αντικατάσταση:</div>
          <div className="row" style={{ gap: 6 }}>
            {others.map((a) => (
              <button key={a} type="button" className="chip" onClick={() => onPickAmount(a)}>{money(a)}</button>
            ))}
          </div>
        </div>
      )}

      <button type="button" className="link small" style={{ alignSelf: 'flex-start' }} onClick={() => setShowText((v) => !v)}>
        {showText ? 'Απόκρυψη' : 'Εμφάνιση'} κειμένου που διαβάστηκε
      </button>
      {showText && (
        <pre
          className="small dim"
          style={{
            whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto', margin: 0,
            background: 'var(--surface-sunk)', padding: 10, borderRadius: 'var(--r-sm)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12,
          }}
        >
          {result.text.trim() || '(κενό)'}
        </pre>
      )}
    </div>
  )
}
