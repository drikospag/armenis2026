import { useMemo, useState } from 'react'
import { ColumnChart, Legend, RankedBars, SplitBar } from '../../../ui/charts'
import type { Series } from '../../../ui/charts'
import { EmptyState, StatTile } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { money, monthKey, monthLabel, num, pct, todayISO, yearOf } from '../../../core/format'
import { useExpenses } from '../store'
import {
  availableYears, change, dailySeries, monthlySeries, rankByCategory, rankByMerchant, summarize, yearlySeries,
} from '../lib/stats'
import type { Expense } from '../types'
import { KIND_COLOR, KIND_LABEL } from '../types'

type Period = 'month' | 'year' | 'all'

const KIND_SERIES: Series[] = [
  { id: 'business', label: KIND_LABEL.business, color: KIND_COLOR.business },
  { id: 'personal', label: KIND_LABEL.personal, color: KIND_COLOR.personal },
]

export function Analytics() {
  const store = useExpenses()
  const today = todayISO()
  const [period, setPeriod] = useState<Period>('month')
  const [year, setYear] = useState(yearOf(today))
  const [month, setMonth] = useState(monthKey(today))
  const [showTable, setShowTable] = useState(false)

  const years = useMemo(() => availableYears(store.expenses), [store.expenses])

  const { rows, previousRows, title, subtitle } = useMemo(() => {
    const all = store.expenses
    if (period === 'month') {
      const prev = prevMonth(month)
      return {
        rows: all.filter((e) => monthKey(e.date) === month),
        previousRows: all.filter((e) => monthKey(e.date) === prev),
        title: monthLabel(month),
        subtitle: `σε σύγκριση με ${monthLabel(prev)}`,
      }
    }
    if (period === 'year') {
      return {
        rows: all.filter((e) => yearOf(e.date) === year),
        previousRows: all.filter((e) => yearOf(e.date) === year - 1),
        title: `Έτος ${year}`,
        subtitle: `σε σύγκριση με ${year - 1}`,
      }
    }
    return { rows: all, previousRows: [] as Expense[], title: 'Όλη η περίοδος', subtitle: '' }
  }, [store.expenses, period, month, year])

  const sum = useMemo(() => summarize(rows), [rows])
  const prevSum = useMemo(() => summarize(previousRows), [previousRows])
  const categories = useMemo(() => rankByCategory(rows, store.categoryById), [rows, store.categoryById])
  const merchants = useMemo(() => rankByMerchant(rows), [rows])

  const columns = useMemo(() => {
    if (period === 'month') return dailySeries(store.expenses, month)
    if (period === 'year') return monthlySeries(store.expenses, year)
    return yearlySeries(store.expenses)
  }, [store.expenses, period, month, year])

  const trend = useMemo(
    () => monthlySeries(store.expenses, year).map((p) => p.values.business + p.values.personal),
    [store.expenses, year],
  )

  if (store.expenses.length === 0) {
    return (
      <EmptyState
        icon="chart"
        title="Δεν υπάρχουν ακόμη δεδομένα"
        hint="Καταχώρησε το πρώτο σου έξοδο ή σκάναρε μια απόδειξη — τα στατιστικά θα εμφανιστούν αυτόματα."
      />
    )
  }

  const budget = store.settings.monthlyBudget
  const budgetUsed = budget > 0 ? sum.personal / budget : null

  return (
    <div className="stack">
      {/* Επιλογή περιόδου — μία σειρά πάνω από τα γραφήματα */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="segmented">
          {(['month', 'year', 'all'] as Period[]).map((p) => (
            <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
              {p === 'month' ? 'Μήνας' : p === 'year' ? 'Έτος' : 'Σύνολο'}
            </button>
          ))}
        </div>

        {period === 'month' && (
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-icon btn-sm" onClick={() => setMonth(prevMonth(month))} aria-label="Προηγούμενος μήνας">
              <Icon name="left" size={16} />
            </button>
            <select className="select" style={{ width: 190 }} value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthOptions(years).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <button className="btn btn-icon btn-sm" onClick={() => setMonth(nextMonth(month))} disabled={month >= monthKey(today)} aria-label="Επόμενος μήνας">
              <Icon name="right" size={16} />
            </button>
          </div>
        )}
        {period === 'year' && (
          <select className="select" style={{ width: 120 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Κύριοι δείκτες */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))' }}>
        <StatTile
          label={`Σύνολο · ${title}`}
          value={money(sum.total)}
          delta={period === 'all' ? null : change(sum.total, prevSum.total)}
          deltaLabel={subtitle}
          trend={period !== 'month' ? undefined : trend}
        />
        <StatTile
          label="Επαγγελματικά"
          value={money(sum.business)}
          accent={KIND_COLOR.business}
          delta={period === 'all' ? null : change(sum.business, prevSum.business)}
          deltaLabel={subtitle}
        />
        <StatTile
          label="Προσωπικά"
          value={money(sum.personal)}
          accent={KIND_COLOR.personal}
          delta={period === 'all' ? null : change(sum.personal, prevSum.personal)}
          deltaLabel={subtitle}
        />
        <StatTile
          label="ΦΠΑ επαγγελματικών"
          value={money(sum.vat)}
          deltaLabel={`${num(sum.count)} κινήσεις · μ.ό. ${money(sum.average)}`}
        />
      </div>

      {/* Κατανομή επαγγελματικά / προσωπικά */}
      <div className="card card-pad stack" style={{ gap: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="h2">Κατανομή</span>
          <Legend series={KIND_SERIES} />
        </div>
        <SplitBar
          parts={[
            { id: 'business', label: KIND_LABEL.business, value: sum.business, color: KIND_COLOR.business },
            { id: 'personal', label: KIND_LABEL.personal, value: sum.personal, color: KIND_COLOR.personal },
          ]}
        />
        <div className="row small muted" style={{ justifyContent: 'space-between' }}>
          <span>{KIND_LABEL.business} · <b className="tnum" style={{ color: 'var(--ink)' }}>{money(sum.business)}</b> {sum.total > 0 && `(${pct(sum.business / sum.total)})`}</span>
          <span>{KIND_LABEL.personal} · <b className="tnum" style={{ color: 'var(--ink)' }}>{money(sum.personal)}</b> {sum.total > 0 && `(${pct(sum.personal / sum.total)})`}</span>
        </div>

        {budgetUsed != null && period === 'month' && (
          <div className="stack" style={{ gap: 6, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Προϋπολογισμός προσωπικών</span>
              <span className="tnum" style={{ fontWeight: 600, color: budgetUsed > 1 ? 'var(--critical)' : 'var(--ink)' }}>
                {money(sum.personal)} / {money(budget)}
              </span>
            </div>
            <div className="progress">
              <i style={{ width: `${Math.min(100, budgetUsed * 100)}%`, background: budgetUsed > 1 ? 'var(--critical)' : budgetUsed > 0.85 ? 'var(--warning)' : 'var(--accent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Χρονοσειρά */}
      <div className="card">
        <div className="card-head">
          <div className="grow">
            <div className="h2">
              {period === 'month' ? 'Ανά ημέρα' : period === 'year' ? 'Ανά μήνα' : 'Ανά έτος'}
            </div>
            <div className="small dim">{title}</div>
          </div>
          <Legend series={KIND_SERIES} />
        </div>
        <div className="card-pad">
          <ColumnChart
            data={columns}
            series={KIND_SERIES}
            height={period === 'month' ? 150 : 190}
            onSelect={period === 'year' ? (key) => { setMonth(key); setPeriod('month') } : undefined}
          />
        </div>
      </div>

      {/* Κατηγορίες */}
      <div className="card">
        <div className="card-head">
          <div className="grow">
            <div className="h2">Ανά κατηγορία</div>
            <div className="small dim">{title} · {categories.length} κατηγορίες</div>
          </div>
          <button className="btn btn-sm" onClick={() => setShowTable((v) => !v)}>
            <Icon name={showTable ? 'chart' : 'list'} size={15} /> {showTable ? 'Γράφημα' : 'Πίνακας'}
          </button>
        </div>
        <div className="card-pad">
          {categories.length === 0 ? (
            <div className="dim small">Καμία κίνηση σε αυτή την περίοδο.</div>
          ) : showTable ? (
            <div className="scroll-x">
              <table className="table">
                <thead>
                  <tr><th>Κατηγορία</th><th className="num">Κινήσεις</th><th className="num">Ποσό</th><th className="num">Μερίδιο</th></tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="row" style={{ gap: 8 }}>
                          <i className="dot" style={{ background: c.color }} />{c.label}
                        </span>
                      </td>
                      <td className="num">{c.count}</td>
                      <td className="num">{money(c.value)}</td>
                      <td className="num">{sum.total > 0 ? pct(c.value / sum.total) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <RankedBars items={categories} />
          )}
        </div>
      </div>

      {/* Κορυφαία καταστήματα */}
      {merchants.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div className="grow">
              <div className="h2">Πού πάνε τα χρήματα</div>
              <div className="small dim">Κορυφαία καταστήματα / προμηθευτές</div>
            </div>
          </div>
          <div className="card-pad">
            <RankedBars items={merchants} />
          </div>
        </div>
      )}
    </div>
  )
}

function prevMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}
function nextMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}
function monthOptions(years: number[]): string[] {
  const out: string[] = []
  for (const y of years) {
    for (let m = 12; m >= 1; m--) out.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return out
}
