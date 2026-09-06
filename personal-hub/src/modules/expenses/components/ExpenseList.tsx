import { useMemo, useState } from 'react'
import { ConfirmDialog, EmptyState } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { SERIES_VARS } from '../../../ui/charts'
import { formatDateLong, money, relativeDay, round2 } from '../../../core/format'
import { useExpenses } from '../store'
import { applyFilters } from '../lib/stats'
import type { Filters } from '../lib/stats'
import { ExpenseForm } from './ExpenseForm'
import { ReceiptViewer } from './ReceiptViewer'
import type { Expense } from '../types'
import { KIND_COLOR, KIND_LABEL, PAYMENT_LABEL } from '../types'

export function ExpenseList({ filters, limit }: { filters: Filters; limit?: number }) {
  const store = useExpenses()
  const toast = useToast()
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  const [shown, setShown] = useState(limit ?? 60)

  const rows = useMemo(
    () => applyFilters(store.expenses, filters, store.categoryById),
    [store.expenses, filters, store.categoryById],
  )
  const visible = rows.slice(0, shown)

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of visible) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return [...map.entries()]
  }, [visible])

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="receipt"
        title="Δεν βρέθηκαν έξοδα"
        hint="Άλλαξε τα φίλτρα ή καταχώρησε το πρώτο σου έξοδο — μπορείς και σκανάροντας μια απόδειξη."
      />
    )
  }

  return (
    <div>
      {groups.map(([date, items]) => {
        const dayTotal = round2(items.reduce((s, e) => s + e.amount, 0))
        return (
          <div key={date}>
            <div
              className="row"
              style={{
                justifyContent: 'space-between', padding: '10px 16px',
                background: 'var(--surface-sunk)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
                position: 'sticky', top: 0, zIndex: 1,
              }}
            >
              <span className="small" style={{ fontWeight: 600 }}>
                {relativeDay(date) ?? formatDateLong(date)}
              </span>
              <span className="small tnum muted">{money(dayTotal)}</span>
            </div>
            {items.map((e) => {
              const cat = store.categoryById.get(e.categoryId)
              return (
                <div
                  key={e.id}
                  className="row expense-row"
                  style={{ gap: 12, padding: '11px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'nowrap' }}
                >
                  <span
                    className="dot"
                    title={cat?.name}
                    style={{ background: SERIES_VARS[(cat?.colorIndex ?? 0) % SERIES_VARS.length], width: 10, height: 10 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 7, flexWrap: 'nowrap' }}>
                      <span style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.merchant || cat?.name || '—'}
                      </span>
                      {e.receiptId && (
                        <button className="btn-ghost dim" title="Προβολή απόδειξης" onClick={() => setViewing(e.receiptId!)}>
                          <Icon name="receipt" size={14} />
                        </button>
                      )}
                      {e.recurringId && <Icon name="repeat" size={13} className="dim" />}
                    </div>
                    <div className="small dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat?.name ?? 'Χωρίς κατηγορία'} · {PAYMENT_LABEL[e.paymentMethod]}
                      {e.notes ? ` · ${e.notes}` : ''}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{ color: KIND_COLOR[e.kind], borderColor: 'var(--line)' }}
                    title={KIND_LABEL[e.kind]}
                  >
                    {e.kind === 'business' ? 'ΕΠΑΓΓ.' : 'ΠΡΟΣ.'}
                  </span>
                  <span className="tnum" style={{ fontWeight: 600, minWidth: 88, textAlign: 'right' }}>{money(e.amount)}</span>
                  <span className="row" style={{ gap: 2 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Επεξεργασία" onClick={() => setEditing(e)}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Διαγραφή" onClick={() => setDeleting(e)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}

      {rows.length > visible.length && (
        <div style={{ padding: 14, textAlign: 'center' }}>
          <button className="btn" onClick={() => setShown((n) => n + 60)}>
            Εμφάνιση περισσότερων ({rows.length - visible.length})
          </button>
        </div>
      )}

      {editing && <ExpenseForm initial={editing} onClose={() => setEditing(null)} />}
      {viewing && <ReceiptViewer receiptId={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Διαγραφή εξόδου"
          message={<>Να διαγραφεί το έξοδο <b>{deleting.merchant || '—'}</b> ({money(deleting.amount)}); Η ενέργεια δεν αναιρείται.</>}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            void store.deleteExpense(deleting.id).then(() => toast.success('Το έξοδο διαγράφηκε.'))
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}
