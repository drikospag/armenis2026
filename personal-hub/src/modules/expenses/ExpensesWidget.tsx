import { useMemo } from 'react'
import { Icon } from '../../ui/Icon'
import { SplitBar } from '../../ui/charts'
import { formatDate, money, monthKey, monthLabel, todayISO } from '../../core/format'
import { ExpenseProvider, useExpenses } from './store'
import { summarize } from './lib/stats'
import { nextOccurrence } from './lib/recurring'
import { KIND_COLOR, KIND_LABEL } from './types'

/** Σύνοψη του τρέχοντος μήνα για το dashboard. */
export function ExpensesWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <ExpenseProvider>
      <Inner onOpen={onOpen} />
    </ExpenseProvider>
  )
}

function Inner({ onOpen }: { onOpen: () => void }) {
  const store = useExpenses()
  const month = monthKey(todayISO())

  const rows = useMemo(() => store.expenses.filter((e) => monthKey(e.date) === month), [store.expenses, month])
  const sum = useMemo(() => summarize(rows), [rows])
  const recent = store.expenses.slice(0, 4)
  const upcoming = useMemo(
    () =>
      store.recurring
        .filter((r) => r.active)
        .map((r) => ({ r, next: nextOccurrence(r) }))
        .filter((x): x is { r: typeof x.r; next: string } => x.next != null)
        .sort((a, b) => (a.next < b.next ? -1 : 1))
        .slice(0, 3),
    [store.recurring],
  )

  if (!store.ready) return <div className="card card-pad dim">Φόρτωση…</div>

  return (
    <div className="card">
      <div className="card-head">
        <div className="grow">
          <div className="h2">Έξοδα · {monthLabel(month)}</div>
          <div className="small dim">{sum.count} κινήσεις αυτόν τον μήνα</div>
        </div>
        <button className="btn btn-sm" onClick={onOpen}>Άνοιγμα <Icon name="right" size={15} /></button>
      </div>

      <div className="card-pad stack" style={{ gap: 14 }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 640, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            {money(sum.total)}
          </div>
          <div className="small dim">συνολικά αυτόν τον μήνα</div>
        </div>

        <SplitBar
          parts={[
            { id: 'b', label: KIND_LABEL.business, value: sum.business, color: KIND_COLOR.business },
            { id: 'p', label: KIND_LABEL.personal, value: sum.personal, color: KIND_COLOR.personal },
          ]}
        />
        <div className="row small muted" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 6 }}>
            <i className="dot" style={{ background: KIND_COLOR.business }} /> {KIND_LABEL.business} {money(sum.business)}
          </span>
          <span className="row" style={{ gap: 6 }}>
            <i className="dot" style={{ background: KIND_COLOR.personal }} /> {KIND_LABEL.personal} {money(sum.personal)}
          </span>
        </div>

        {recent.length > 0 && (
          <div className="stack" style={{ gap: 6, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
            <div className="h3">Τελευταίες κινήσεις</div>
            {recent.map((e) => (
              <div key={e.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.merchant || store.categoryById.get(e.categoryId)?.name || '—'}
                </span>
                <span className="row dim" style={{ gap: 10, flexWrap: 'nowrap' }}>
                  <span>{formatDate(e.date)}</span>
                  <span className="tnum" style={{ color: 'var(--ink)', fontWeight: 560 }}>{money(e.amount)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="stack" style={{ gap: 6, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
            <div className="h3">Επόμενα πάγια</div>
            {upcoming.map(({ r, next }) => (
              <div key={r.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <span className="row" style={{ gap: 6 }}><Icon name="repeat" size={13} className="dim" /> {r.label}</span>
                <span className="row dim" style={{ gap: 10, flexWrap: 'nowrap' }}>
                  <span>{formatDate(next)}</span>
                  <span className="tnum" style={{ color: 'var(--ink)', fontWeight: 560 }}>{money(r.amount)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
