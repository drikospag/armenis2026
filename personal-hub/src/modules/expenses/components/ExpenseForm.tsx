import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { money, round2, todayISO } from '../../../core/format'
import { useExpenses } from '../store'
import { guessCategory } from '../lib/receiptParser'
import { netFromGross, vatFromGross } from '../lib/recurring'
import { ReceiptScanner, ScanSummary, useOcrAvailable } from './ReceiptScanner'
import type { ScanResult } from './ReceiptScanner'
import type { Expense, Kind, PaymentMethod } from '../types'
import { KIND_ICON, KIND_LABEL, PAYMENT_LABEL, VAT_RATES } from '../types'

interface Props {
  initial?: Expense
  /** Άνοιγμα κατευθείαν στη σάρωση απόδειξης. */
  startWithScan?: boolean
  onClose: () => void
}

export function ExpenseForm({ initial, startWithScan = false, onClose }: Props) {
  const store = useExpenses()
  const toast = useToast()
  const editing = initial != null

  const [kind, setKind] = useState<Kind>(initial?.kind ?? store.settings.defaultKind)
  const [amount, setAmount] = useState(initial ? formatAmount(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [merchant, setMerchant] = useState(initial?.merchant ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? store.settings.defaultPaymentMethod)
  const [vatRate, setVatRate] = useState<number>(initial?.vatRate ?? (initial ? 0 : store.settings.defaultVatRate))
  const [taxId, setTaxId] = useState(initial?.taxId ?? '')
  const [docNumber, setDocNumber] = useState(initial?.docNumber ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null)
  const [removeReceipt, setRemoveReceipt] = useState(false)
  const [showScanner, setShowScanner] = useState(startWithScan)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const ocrReady = useOcrAvailable() !== false

  const categories = useMemo(
    () => store.categories.filter((c) => !c.hidden && (c.scope === kind || c.scope === 'both')),
    [store.categories, kind],
  )
  const merchants = useMemo(
    () => [...new Set(store.expenses.map((e) => e.merchant).filter(Boolean))].slice(0, 200),
    [store.expenses],
  )

  // Κράτα έγκυρη κατηγορία όταν αλλάζει ο τύπος του εξόδου.
  useEffect(() => {
    if (!categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? '')
    }
  }, [categories, categoryId])

  // Φόρτωσε τη φωτογραφία της αποθηκευμένης απόδειξης (σε επεξεργασία).
  useEffect(() => {
    let url: string | null = null
    if (initial?.receiptId) {
      void store.getReceipt(initial.receiptId).then((r) => {
        if (r) { url = URL.createObjectURL(r.blob); setExistingReceiptUrl(url) }
      })
    }
    return () => { if (url) URL.revokeObjectURL(url) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.receiptId])

  const amountValue = parseAmount(amount)
  const vat = vatRate ? vatFromGross(amountValue, vatRate) : 0
  const net = vatRate ? netFromGross(amountValue, vatRate) : amountValue
  const amountError = submitted && !(amountValue > 0)

  function applyScan(r: ScanResult) {
    setScan(r)
    setShowScanner(false)
    const p = r.parsed
    if (p.total != null) setAmount(formatAmount(p.total))
    if (p.date) setDate(p.date)
    if (p.merchant) setMerchant(p.merchant)
    if (p.taxId) setTaxId(p.taxId)
    if (p.docNumber) setDocNumber(p.docNumber)
    if (p.vatRate != null) setVatRate(p.vatRate)
    // Απόδειξη με ΑΦΜ είναι σχεδόν πάντα επαγγελματικό παραστατικό.
    const nextKind: Kind = p.taxId ? 'business' : kind
    setKind(nextKind)
    const guess = guessCategory(p.merchant ?? '', r.text, nextKind)
    if (guess) setCategoryId(guess)
    toast.success('Η απόδειξη διαβάστηκε — έλεγξε τα πεδία και αποθήκευσε.')
  }

  async function save() {
    setSubmitted(true)
    if (!(amountValue > 0)) return
    if (!categoryId) { toast.error('Διάλεξε κατηγορία.'); return }
    setSaving(true)
    try {
      let receiptId = initial?.receiptId
      if (removeReceipt && receiptId) {
        await store.deleteReceipt(receiptId)
        receiptId = undefined
      }
      if (scan) {
        if (receiptId) await store.deleteReceipt(receiptId)
        receiptId = await store.saveReceipt(scan.image, scan.text)
      }

      const payload = {
        date,
        amount: round2(amountValue),
        kind,
        categoryId,
        merchant: merchant.trim(),
        paymentMethod,
        vatRate: vatRate || undefined,
        vatAmount: vatRate ? vat : undefined,
        taxId: taxId.trim() || undefined,
        docNumber: docNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        receiptId,
      }

      if (editing) {
        await store.updateExpense(initial.id, payload)
        toast.success('Το έξοδο ενημερώθηκε.')
      } else {
        await store.addExpense({ ...payload, source: scan ? 'scan' : 'manual' })
        toast.success(`Καταχωρήθηκε ${money(round2(amountValue))}.`)
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Η αποθήκευση απέτυχε.')
    } finally {
      setSaving(false)
    }
  }

  const receiptPreview = scan?.previewUrl ?? (removeReceipt ? null : existingReceiptUrl)

  return (
    <Modal
      title={editing ? 'Επεξεργασία εξόδου' : 'Νέο έξοδο'}
      subtitle={editing ? undefined : 'Σκάναρε την απόδειξη ή συμπλήρωσε τα πεδία.'}
      onClose={onClose}
      width={680}
      footer={
        <>
          <button className="btn" onClick={onClose}>Άκυρο</button>
          <button className="btn btn-primary" onClick={() => void save()} disabled={saving}>
            <Icon name="check" size={16} /> {editing ? 'Αποθήκευση' : 'Καταχώρηση'}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        {!editing && showScanner && <ReceiptScanner onResult={applyScan} />}

        {ocrReady && !showScanner && !receiptPreview && !editing && (
          <button type="button" className="btn" onClick={() => setShowScanner(true)} style={{ alignSelf: 'flex-start' }}>
            <Icon name="scan" size={16} /> Σάρωση απόδειξης
          </button>
        )}

        {receiptPreview && (
          <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <a href={receiptPreview} target="_blank" rel="noreferrer" style={{ flex: 'none' }}>
              <img
                src={receiptPreview}
                alt="Απόδειξη"
                style={{ width: 92, height: 118, objectFit: 'cover', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}
              />
            </a>
            <div className="stack" style={{ gap: 8, flex: 1, minWidth: 0 }}>
              {scan ? (
                <ScanSummary result={scan} onPickAmount={(v) => setAmount(formatAmount(v))} />
              ) : (
                <div className="small dim">Συνημμένη απόδειξη</div>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ alignSelf: 'flex-start', color: 'var(--critical)' }}
                onClick={() => { setScan(null); setRemoveReceipt(true); setExistingReceiptUrl(null) }}
              >
                <Icon name="trash" size={15} /> Αφαίρεση
              </button>
            </div>
          </div>
        )}

        <div className="segmented" style={{ alignSelf: 'flex-start' }}>
          {(['business', 'personal'] as Kind[]).map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              <span className="row" style={{ gap: 6 }}>
                <Icon name={KIND_ICON[k]} size={15} /> {KIND_LABEL[k]}
              </span>
            </button>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)' }}>
          <label className="field">
            <span className="label">Ποσό (με ΦΠΑ)</span>
            <div style={{ position: 'relative' }}>
              <input
                className="input input-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingRight: 30, borderColor: amountError ? 'var(--critical)' : undefined }}
                autoFocus
              />
              <span className="dim" style={{ position: 'absolute', right: 11, top: 11, fontSize: '1.05rem' }}>€</span>
            </div>
            {amountError && <span className="small" style={{ color: 'var(--critical)' }}>Δώσε ποσό μεγαλύτερο από 0.</span>}
          </label>

          <label className="field">
            <span className="label">Ημερομηνία</span>
            <input className="input" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} style={{ height: 46 }} />
          </label>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)' }}>
          <label className="field">
            <span className="label">Κατηγορία</span>
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="label">Κατάστημα / προμηθευτής</span>
            <input className="input" list="ph-merchants" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="π.χ. Σκλαβενίτης" />
            <datalist id="ph-merchants">
              {merchants.map((m) => <option key={m} value={m} />)}
            </datalist>
          </label>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)' }}>
          <label className="field">
            <span className="label">Τρόπος πληρωμής</span>
            <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((p) => (
                <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">ΦΠΑ</span>
            <select className="select" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))}>
              <option value={0}>Χωρίς ανάλυση ΦΠΑ</option>
              {VAT_RATES.filter(Boolean).map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </label>
        </div>

        {vatRate > 0 && amountValue > 0 && (
          <div className="row small muted" style={{ gap: 16, padding: '2px 2px' }}>
            <span>Καθαρή αξία <b className="tnum" style={{ color: 'var(--ink)' }}>{money(net)}</b></span>
            <span>ΦΠΑ {vatRate}% <b className="tnum" style={{ color: 'var(--ink)' }}>{money(vat)}</b></span>
          </div>
        )}

        {kind === 'business' && (
          <div className="grid" style={{ gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)' }}>
            <label className="field">
              <span className="label">ΑΦΜ προμηθευτή</span>
              <input className="input" inputMode="numeric" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="—" />
            </label>
            <label className="field">
              <span className="label">Αρ. παραστατικού</span>
              <input className="input" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="—" />
            </label>
          </div>
        )}

        <label className="field">
          <span className="label">Σημειώσεις</span>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Προαιρετικά — π.χ. συνάντηση με πελάτη" />
        </label>
      </div>
    </Modal>
  )
}

/** Μορφοποιεί ποσό για το πεδίο εισαγωγής: 60 → «60,00». */
export function formatAmount(n: number): string {
  return n.toFixed(2).replace('.', ',')
}

/** Δέχεται και «12,50» και «12.50». */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const v = Number(cleaned)
  return isFinite(v) ? v : 0
}
