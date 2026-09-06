import { useMemo, useState } from 'react'
import { ConfirmDialog, EmptyState, Modal } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { SERIES_VARS } from '../../../ui/charts'
import { formatDate, money, round2, todayISO } from '../../../core/format'
import { uid } from '../../../core/id'
import { useExpenses } from '../store'
import { annualCost, nextOccurrence } from '../lib/recurring'
import { formatAmount, parseAmount } from './ExpenseForm'
import type { Frequency, Kind, PaymentMethod, Recurring } from '../types'
import { FREQUENCY_LABEL, KIND_ICON, KIND_LABEL, PAYMENT_LABEL, VAT_RATES } from '../types'

/**
 * Πάγια / επαναλαμβανόμενα έξοδα: ασφάλειες, συνδρομές, ΕΝΦΙΑ, τέλη κυκλοφορίας…
 * Οι εγγραφές δημιουργούνται αυτόματα όταν έρθει η ημερομηνία χρέωσης.
 */
export function RecurringPanel() {
  const store = useExpenses()
  const toast = useToast()
  const [editing, setEditing] = useState<Recurring | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Recurring | null>(null)

  const rows = useMemo(
    () => [...store.recurring].sort((a, b) => annualCost(b) - annualCost(a)),
    [store.recurring],
  )
  const totalYear = round2(rows.filter((r) => r.active).reduce((s, r) => s + annualCost(r), 0))
  const businessYear = round2(rows.filter((r) => r.active && r.kind === 'business').reduce((s, r) => s + annualCost(r), 0))

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="h2">Πάγια έξοδα</div>
          <div className="small dim">Δημιουργούνται αυτόματα στην ημερομηνία χρέωσης.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn"
            onClick={() =>
              void store.runRecurring().then((n) =>
                n > 0 ? toast.success(`Δημιουργήθηκαν ${n} εγγραφές.`) : toast.push('Δεν εκκρεμεί καμία χρέωση.'),
              )
            }
          >
            <Icon name="refresh" size={16} /> Έλεγχος τώρα
          </button>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} /> Νέο πάγιο
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="card card-pad">
            <div className="small muted">Ετήσιο κόστος πάγιων</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 640, letterSpacing: '-0.02em' }}>{money(totalYear)}</div>
            <div className="small dim">≈ {money(round2(totalYear / 12))} τον μήνα</div>
          </div>
          <div className="card card-pad">
            <div className="small muted">Από αυτά επαγγελματικά</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 640, letterSpacing: '-0.02em' }}>{money(businessYear)}</div>
            <div className="small dim">{rows.filter((r) => r.active).length} ενεργά πάγια</div>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="repeat"
            title="Δεν έχεις πάγια έξοδα"
            hint="Πρόσθεσε ό,τι πληρώνεις σταθερά — ασφάλεια αυτοκινήτου, ΕΝΦΙΑ, συνδρομές, ενοίκιο. Η εφαρμογή θα τα καταγράφει μόνη της."
            action={<button className="btn btn-primary" onClick={() => setEditing('new')}><Icon name="plus" size={16} /> Νέο πάγιο</button>}
          />
        </div>
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th>Πάγιο</th>
                <th>Συχνότητα</th>
                <th>Επόμενη χρέωση</th>
                <th className="num">Ποσό</th>
                <th className="num">Ανά έτος</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const cat = store.categoryById.get(r.categoryId)
                const next = r.active ? nextOccurrence(r) : null
                const overdue = next != null && next <= todayISO()
                return (
                  <tr key={r.id} style={{ opacity: r.active ? 1 : 0.55 }}>
                    <td>
                      <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
                        <i className="dot" style={{ background: SERIES_VARS[(cat?.colorIndex ?? 0) % SERIES_VARS.length] }} />
                        <div>
                          <div style={{ fontWeight: 550 }}>{r.label}</div>
                          <div className="small dim">{KIND_LABEL[r.kind]} · {cat?.name ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small">{FREQUENCY_LABEL[r.frequency]}</td>
                    <td className="small">
                      {!r.active ? <span className="badge">Ανενεργό</span>
                        : next ? <span style={{ color: overdue ? 'var(--serious)' : undefined }}>{formatDate(next)}</span>
                        : <span className="dim">Έληξε</span>}
                    </td>
                    <td className="num">{money(r.amount)}</td>
                    <td className="num muted">{money(annualCost(r))}</td>
                    <td className="num">
                      <span className="row" style={{ gap: 2, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title={r.active ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
                          onClick={() => void store.saveRecurring({ ...r, active: !r.active, updatedAt: Date.now() })}
                        >
                          <Icon name={r.active ? 'check' : 'close'} size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Επεξεργασία" onClick={() => setEditing(r)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Διαγραφή" onClick={() => setDeleting(r)}>
                          <Icon name="trash" size={15} />
                        </button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <RecurringForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Διαγραφή πάγιου"
          message={<>Να διαγραφεί το πάγιο <b>{deleting.label}</b>; Οι εγγραφές που έχουν ήδη δημιουργηθεί παραμένουν.</>}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            void store.deleteRecurring(deleting.id).then(() => toast.success('Το πάγιο διαγράφηκε.'))
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}

function RecurringForm({ initial, onClose }: { initial?: Recurring; onClose: () => void }) {
  const store = useExpenses()
  const toast = useToast()

  const [label, setLabel] = useState(initial?.label ?? '')
  const [amount, setAmount] = useState(initial ? formatAmount(initial.amount) : '')
  const [kind, setKind] = useState<Kind>(initial?.kind ?? 'personal')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [merchant, setMerchant] = useState(initial?.merchant ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? 'card')
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'yearly')
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO())
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [vatRate, setVatRate] = useState(initial?.vatRate ?? 0)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [active, setActive] = useState(initial?.active ?? true)

  const categories = store.categories.filter((c) => !c.hidden && (c.scope === kind || c.scope === 'both'))
  const value = parseAmount(amount)

  const effectiveCategory = categories.some((c) => c.id === categoryId) ? categoryId : categories[0]?.id ?? ''

  async function save() {
    if (!label.trim()) { toast.error('Δώσε όνομα στο πάγιο.'); return }
    if (!(value > 0)) { toast.error('Δώσε ποσό μεγαλύτερο από 0.'); return }
    const now = Date.now()
    const row: Recurring = {
      id: initial?.id ?? uid('rc'),
      label: label.trim(),
      amount: round2(value),
      kind,
      categoryId: effectiveCategory,
      merchant: merchant.trim(),
      paymentMethod,
      frequency,
      startDate,
      endDate: endDate || undefined,
      vatRate: vatRate || undefined,
      notes: notes.trim() || undefined,
      active,
      lastGenerated: initial?.lastGenerated,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    }
    await store.saveRecurring(row)
    const n = await store.runRecurring()
    toast.success(n > 0 ? `Αποθηκεύτηκε — δημιουργήθηκαν ${n} εγγραφές.` : 'Το πάγιο αποθηκεύτηκε.')
    onClose()
  }

  return (
    <Modal
      title={initial ? 'Επεξεργασία πάγιου' : 'Νέο πάγιο έξοδο'}
      subtitle="Π.χ. ασφάλεια αυτοκινήτου (ετήσια), συνδρομή (μηνιαία), ΕΝΦΙΑ."
      onClose={onClose}
      width={620}
      footer={
        <>
          <button className="btn" onClick={onClose}>Άκυρο</button>
          <button className="btn btn-primary" onClick={() => void save()}><Icon name="check" size={16} /> Αποθήκευση</button>
        </>
      }
    >
      <div className="stack" style={{ gap: 14 }}>
        <label className="field">
          <span className="label">Όνομα</span>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="π.χ. Ασφάλεια αυτοκινήτου" />
        </label>

        <div className="segmented" style={{ alignSelf: 'flex-start' }}>
          {(['business', 'personal'] as Kind[]).map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              <span className="row" style={{ gap: 6 }}><Icon name={KIND_ICON[k]} size={15} /> {KIND_LABEL[k]}</span>
            </button>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <label className="field">
            <span className="label">Ποσό ανά χρέωση</span>
            <input className="input input-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </label>
          <label className="field">
            <span className="label">Συχνότητα</span>
            <select className="select" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} style={{ height: 46 }}>
              {(Object.keys(FREQUENCY_LABEL) as Frequency[]).map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>
              ))}
            </select>
          </label>
        </div>

        {value > 0 && (
          <div className="small muted">
            Ετήσιο κόστος: <b className="tnum" style={{ color: 'var(--ink)' }}>{money(round2((value * 12) / ({ monthly: 1, bimonthly: 2, quarterly: 3, semiannual: 6, yearly: 12 })[frequency]))}</b>
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <label className="field">
            <span className="label">Πρώτη χρέωση</span>
            <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">Λήξη (προαιρετικά)</span>
            <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <label className="field">
            <span className="label">Κατηγορία</span>
            <select className="select" value={effectiveCategory} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Δικαιούχος</span>
            <input className="input" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="π.χ. Interamerican" />
          </label>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <label className="field">
            <span className="label">Τρόπος πληρωμής</span>
            <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((p) => <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>)}
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

        <label className="field">
          <span className="label">Σημειώσεις</span>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <button type="button" className="row" style={{ gap: 10 }} onClick={() => setActive(!active)}>
          <span className="switch" role="switch" aria-checked={active} />
          <span className="small" style={{ fontWeight: 500 }}>Ενεργό — να δημιουργούνται εγγραφές αυτόματα</span>
        </button>
      </div>
    </Modal>
  )
}
