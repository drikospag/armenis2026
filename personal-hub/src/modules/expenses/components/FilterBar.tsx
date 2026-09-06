import { useState } from 'react'
import { Icon } from '../../../ui/Icon'
import { SERIES_VARS } from '../../../ui/charts'
import { useExpenses } from '../store'
import type { Filters } from '../lib/stats'
import { EMPTY_FILTERS } from '../lib/stats'
import type { Kind, PaymentMethod } from '../types'
import { KIND_LABEL, PAYMENT_LABEL } from '../types'

export function FilterBar({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const store = useExpenses()
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch })
  const activeCount =
    (value.kind !== 'all' ? 1 : 0) + value.categoryIds.length +
    (value.from ? 1 : 0) + (value.to ? 1 : 0) + (value.paymentMethod ? 1 : 0) + (value.onlyWithReceipt ? 1 : 0)

  const categories = store.categories.filter(
    (c) => !c.hidden && (value.kind === 'all' || c.scope === value.kind || c.scope === 'both'),
  )

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 190 }}>
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            placeholder="Αναζήτηση σε κατάστημα, σημείωση, ποσό…"
            value={value.search}
            onChange={(e) => set({ search: e.target.value })}
          />
          <span style={{ position: 'absolute', left: 11, top: 10, pointerEvents: 'none' }} className="dim">
            <Icon name="search" size={16} />
          </span>
        </div>

        <div className="segmented">
          {(['all', 'business', 'personal'] as (Kind | 'all')[]).map((k) => (
            <button key={k} aria-pressed={value.kind === k} onClick={() => set({ kind: k, categoryIds: [] })}>
              {k === 'all' ? 'Όλα' : KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <button className="btn" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
          <Icon name="filter" size={15} /> Φίλτρα
          {activeCount > 0 && <span className="badge" style={{ background: 'var(--accent-wash)', color: 'var(--accent-ink)', borderColor: 'transparent' }}>{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => onChange({ ...EMPTY_FILTERS, search: value.search })}>
            Καθαρισμός
          </button>
        )}
      </div>

      {open && (
        <div className="card card-pad stack" style={{ gap: 14 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <label className="field">
              <span className="label">Από</span>
              <input className="input" type="date" value={value.from ?? ''} onChange={(e) => set({ from: e.target.value || undefined })} />
            </label>
            <label className="field">
              <span className="label">Έως</span>
              <input className="input" type="date" value={value.to ?? ''} onChange={(e) => set({ to: e.target.value || undefined })} />
            </label>
            <label className="field">
              <span className="label">Τρόπος πληρωμής</span>
              <select
                className="select"
                value={value.paymentMethod ?? ''}
                onChange={(e) => set({ paymentMethod: e.target.value || undefined })}
              >
                <option value="">Όλοι</option>
                {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((p) => (
                  <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Απόδειξη</span>
              <select
                className="select"
                value={value.onlyWithReceipt ? '1' : ''}
                onChange={(e) => set({ onlyWithReceipt: e.target.value === '1' || undefined })}
              >
                <option value="">Όλα τα έξοδα</option>
                <option value="1">Μόνο με συνημμένη απόδειξη</option>
              </select>
            </label>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 7 }}>Κατηγορίες</div>
            <div className="row" style={{ gap: 6 }}>
              {categories.map((c) => {
                const on = value.categoryIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    className="chip"
                    aria-pressed={on}
                    onClick={() =>
                      set({ categoryIds: on ? value.categoryIds.filter((x) => x !== c.id) : [...value.categoryIds, c.id] })
                    }
                  >
                    <i className="dot" style={{ background: SERIES_VARS[c.colorIndex % SERIES_VARS.length] }} />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
