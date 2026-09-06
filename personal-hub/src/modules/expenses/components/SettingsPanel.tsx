import { useRef, useState } from 'react'
import { ConfirmDialog, Modal } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { SERIES_VARS } from '../../../ui/charts'
import { money, todayISO } from '../../../core/format'
import { uid } from '../../../core/id'
import { useExpenses } from '../store'
import { buildBackup, download, parseBackup, toCSV } from '../lib/transfer'
import { parseAmount } from './ExpenseForm'
import type { Category, Kind } from '../types'
import { KIND_LABEL, PAYMENT_LABEL, VAT_RATES } from '../types'
import type { PaymentMethod } from '../types'

export function SettingsPanel() {
  const store = useExpenses()
  const toast = useToast()
  const importRef = useRef<HTMLInputElement>(null)
  const [editingCat, setEditingCat] = useState<Category | 'new' | null>(null)
  const [wiping, setWiping] = useState(false)
  const [budget, setBudget] = useState(String(store.settings.monthlyBudget || '').replace('.', ','))

  const usage = (id: string) => store.expenses.filter((e) => e.categoryId === id).length

  async function onImport(file: File | undefined | null) {
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      const existing = new Set(store.expenses.map((e) => `${e.date}|${e.amount}|${e.merchant}`))
      const fresh = backup.expenses.filter((e) => !existing.has(`${e.date}|${e.amount}|${e.merchant}`))
      for (const c of backup.categories ?? []) {
        if (!store.categoryById.has(c.id)) await store.saveCategory(c)
      }
      for (const r of backup.recurring ?? []) await store.saveRecurring(r)
      await store.addManyExpenses(fresh)
      toast.success(`Εισήχθησαν ${fresh.length} έξοδα (${backup.expenses.length - fresh.length} διπλότυπα παραλείφθηκαν).`)
    } catch (err) {
      console.error(err)
      toast.error('Το αρχείο δεν διαβάστηκε. Βεβαιώσου ότι είναι αντίγραφο ασφαλείας των εξόδων.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <div className="stack">
      {/* Προεπιλογές */}
      <div className="card">
        <div className="card-head"><div className="h2 grow">Προεπιλογές καταχώρησης</div></div>
        <div className="card-pad grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <label className="field">
            <span className="label">Προεπιλεγμένος τύπος</span>
            <select
              className="select"
              value={store.settings.defaultKind}
              onChange={(e) => void store.saveSettings({ defaultKind: e.target.value as Kind })}
            >
              {(['personal', 'business'] as Kind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Προεπιλεγμένη πληρωμή</span>
            <select
              className="select"
              value={store.settings.defaultPaymentMethod}
              onChange={(e) => void store.saveSettings({ defaultPaymentMethod: e.target.value as PaymentMethod })}
            >
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((p) => <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Προεπιλεγμένος ΦΠΑ</span>
            <select
              className="select"
              value={store.settings.defaultVatRate}
              onChange={(e) => void store.saveSettings({ defaultVatRate: Number(e.target.value) })}
            >
              <option value={0}>Χωρίς</option>
              {VAT_RATES.filter(Boolean).map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </label>
          <label className="field">
            <span className="label">Μηνιαίος προϋπολογισμός (προσωπικά)</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0 = ανενεργός"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={() => void store.saveSettings({ monthlyBudget: parseAmount(budget) })}
            />
          </label>
        </div>
        <div className="card-pad" style={{ paddingTop: 0 }}>
          <button
            type="button"
            className="row"
            style={{ gap: 10 }}
            onClick={() => void store.saveSettings({ autoGenerateRecurring: !store.settings.autoGenerateRecurring })}
          >
            <span className="switch" role="switch" aria-checked={store.settings.autoGenerateRecurring} />
            <span className="small" style={{ fontWeight: 500 }}>Αυτόματη καταγραφή πάγιων εξόδων στο άνοιγμα της εφαρμογής</span>
          </button>
        </div>
      </div>

      {/* Κατηγορίες */}
      <div className="card">
        <div className="card-head">
          <div className="grow">
            <div className="h2">Κατηγορίες</div>
            <div className="small dim">{store.categories.filter((c) => !c.hidden).length} ενεργές</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setEditingCat('new')}>
            <Icon name="plus" size={15} /> Νέα
          </button>
        </div>
        <div className="card-pad stack" style={{ gap: 18 }}>
          {(['business', 'personal'] as Kind[]).map((k) => (
            <div key={k}>
              <div className="h3" style={{ marginBottom: 8 }}>{KIND_LABEL[k]}</div>
              <div className="row" style={{ gap: 6 }}>
                {store.categories
                  .filter((c) => c.scope === k || c.scope === 'both')
                  .map((c) => (
                    <button
                      key={c.id}
                      className="chip"
                      style={{ opacity: c.hidden ? 0.45 : 1 }}
                      onClick={() => setEditingCat(c)}
                      title={`${usage(c.id)} κινήσεις`}
                    >
                      <i className="dot" style={{ background: SERIES_VARS[c.colorIndex % SERIES_VARS.length] }} />
                      {c.name}
                      {c.hidden && <Icon name="close" size={12} />}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Δεδομένα */}
      <div className="card">
        <div className="card-head">
          <div className="grow">
            <div className="h2">Δεδομένα</div>
            <div className="small dim">Όλα αποθηκεύονται τοπικά στον browser σου. Κράτα αντίγραφο τακτικά.</div>
          </div>
        </div>
        <div className="card-pad row" style={{ gap: 8 }}>
          <button
            className="btn"
            onClick={() => {
              download(
                `exoda-${todayISO()}.csv`,
                toCSV(store.expenses, store.categoryById),
                'text/csv',
              )
              toast.success('Το CSV κατέβηκε — έτοιμο για τον λογιστή.')
            }}
          >
            <Icon name="download" size={16} /> Εξαγωγή CSV
          </button>
          <button
            className="btn"
            onClick={() => {
              const backup = buildBackup(store.expenses, store.categories, store.recurring, store.settings)
              download(`personal-hub-backup-${todayISO()}.json`, JSON.stringify(backup, null, 2), 'application/json')
              toast.success('Το αντίγραφο ασφαλείας κατέβηκε.')
            }}
          >
            <Icon name="download" size={16} /> Αντίγραφο ασφαλείας (JSON)
          </button>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onImport(e.target.files?.[0])} />
          <button className="btn" onClick={() => importRef.current?.click()}>
            <Icon name="upload" size={16} /> Εισαγωγή
          </button>
          <span className="grow" />
          <button className="btn btn-danger" onClick={() => setWiping(true)}>
            <Icon name="trash" size={16} /> Διαγραφή όλων
          </button>
        </div>
        <div className="card-pad small dim" style={{ paddingTop: 0 }}>
          Σύνολο: {store.expenses.length} έξοδα · {store.recurring.length} πάγια ·{' '}
          {money(store.expenses.reduce((s, e) => s + e.amount, 0))} συνολικά καταγεγραμμένα.
        </div>
      </div>

      {editingCat && (
        <CategoryForm
          initial={editingCat === 'new' ? undefined : editingCat}
          usageCount={editingCat === 'new' ? 0 : usage(editingCat.id)}
          onClose={() => setEditingCat(null)}
        />
      )}
      {wiping && (
        <ConfirmDialog
          title="Διαγραφή όλων των δεδομένων"
          message="Θα σβηστούν όλα τα έξοδα, τα πάγια και οι αποδείξεις από αυτόν τον browser. Κατέβασε πρώτα αντίγραφο ασφαλείας — η ενέργεια δεν αναιρείται."
          confirmLabel="Διαγραφή όλων"
          onCancel={() => setWiping(false)}
          onConfirm={() => {
            void store.wipeAll().then(() => toast.success('Όλα τα δεδομένα διαγράφηκαν.'))
            setWiping(false)
          }}
        />
      )}
    </div>
  )
}

function CategoryForm({ initial, usageCount, onClose }: { initial?: Category; usageCount: number; onClose: () => void }) {
  const store = useExpenses()
  const toast = useToast()
  const [name, setName] = useState(initial?.name ?? '')
  const [scope, setScope] = useState<Category['scope']>(initial?.scope ?? 'personal')
  const [colorIndex, setColorIndex] = useState(initial?.colorIndex ?? 0)
  const [hidden, setHidden] = useState(initial?.hidden ?? false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function save() {
    if (!name.trim()) { toast.error('Δώσε όνομα κατηγορίας.'); return }
    await store.saveCategory({
      id: initial?.id ?? uid('c'),
      name: name.trim(),
      scope,
      colorIndex,
      icon: initial?.icon ?? 'tag',
      builtIn: initial?.builtIn,
      hidden,
    })
    toast.success('Η κατηγορία αποθηκεύτηκε.')
    onClose()
  }

  return (
    <>
      <Modal
        title={initial ? 'Επεξεργασία κατηγορίας' : 'Νέα κατηγορία'}
        subtitle={initial ? `${usageCount} κινήσεις σε αυτή την κατηγορία` : undefined}
        onClose={onClose}
        width={480}
        footer={
          <>
            {initial && !initial.builtIn && (
              <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => setConfirmDelete(true)}>
                <Icon name="trash" size={15} /> Διαγραφή
              </button>
            )}
            <button className="btn" onClick={onClose}>Άκυρο</button>
            <button className="btn btn-primary" onClick={() => void save()}>Αποθήκευση</button>
          </>
        }
      >
        <div className="stack" style={{ gap: 14 }}>
          <label className="field">
            <span className="label">Όνομα</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>

          <div className="field">
            <span className="label">Εμφανίζεται σε</span>
            <div className="segmented" style={{ alignSelf: 'flex-start' }}>
              {(['business', 'personal', 'both'] as Category['scope'][]).map((s) => (
                <button key={s} type="button" aria-pressed={scope === s} onClick={() => setScope(s)}>
                  {s === 'both' ? 'Και στα δύο' : KIND_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">Χρώμα</span>
            <div className="row" style={{ gap: 8 }}>
              {SERIES_VARS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Χρώμα ${i + 1}`}
                  onClick={() => setColorIndex(i)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: c,
                    outline: colorIndex === i ? '2px solid var(--ink)' : 'none', outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          <button type="button" className="row" style={{ gap: 10 }} onClick={() => setHidden(!hidden)}>
            <span className="switch" role="switch" aria-checked={!hidden} />
            <span className="small" style={{ fontWeight: 500 }}>
              {hidden ? 'Κρυμμένη — δεν εμφανίζεται στη φόρμα' : 'Ενεργή'}
            </span>
          </button>
        </div>
      </Modal>

      {confirmDelete && initial && (
        <ConfirmDialog
          title="Διαγραφή κατηγορίας"
          message={
            usageCount > 0
              ? `Υπάρχουν ${usageCount} κινήσεις σε αυτή την κατηγορία. Θα μείνουν χωρίς κατηγορία. Καλύτερα κρύψ' την αντί να τη διαγράψεις.`
              : 'Να διαγραφεί η κατηγορία;'
          }
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            void store.deleteCategory(initial.id).then(() => toast.success('Η κατηγορία διαγράφηκε.'))
            setConfirmDelete(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
