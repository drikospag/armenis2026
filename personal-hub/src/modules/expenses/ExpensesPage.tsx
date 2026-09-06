import { useMemo, useState } from 'react'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { money, todayISO } from '../../core/format'
import { ExpenseProvider, useExpenses } from './store'
import { Analytics } from './components/Analytics'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { FilterBar } from './components/FilterBar'
import { RecurringPanel } from './components/RecurringPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { applyFilters, summarize } from './lib/stats'
import type { Filters } from './lib/stats'
import { EMPTY_FILTERS } from './lib/stats'
import { download, toCSV } from './lib/transfer'

type Tab = 'overview' | 'list' | 'recurring' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Επισκόπηση', icon: 'chart' },
  { id: 'list', label: 'Κινήσεις', icon: 'list' },
  { id: 'recurring', label: 'Πάγια', icon: 'repeat' },
  { id: 'settings', label: 'Ρυθμίσεις', icon: 'settings' },
]

/** Το module των εξόδων — τυλίγει τα πάντα στον δικό του provider δεδομένων. */
export function ExpensesPage() {
  return (
    <ExpenseProvider>
      <ExpensesInner />
    </ExpenseProvider>
  )
}

function ExpensesInner() {
  const store = useExpenses()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [creating, setCreating] = useState<null | { scan: boolean }>(null)

  const filtered = useMemo(
    () => applyFilters(store.expenses, filters, store.categoryById),
    [store.expenses, filters, store.categoryById],
  )
  const filteredSum = useMemo(() => summarize(filtered), [filtered])

  if (!store.ready) {
    return <div className="page dim">Φόρτωση δεδομένων…</div>
  }

  return (
    <>
      <div className="topbar">
        <div className="grow">
          <div className="h1">Έξοδα</div>
          <div className="small dim">Καθημερινή καταγραφή, αποδείξεις και ιστορικό — όλα τοπικά.</div>
        </div>
        <button className="btn" onClick={() => setCreating({ scan: true })} title="Σάρωση απόδειξης" aria-label="Σάρωση απόδειξης">
          <Icon name="scan" size={16} /> <span className="hide-sm">Σάρωση</span>
        </button>
        <button className="btn btn-primary" onClick={() => setCreating({ scan: false })}>
          <Icon name="plus" size={16} /> Νέο έξοδο
        </button>
      </div>

      <div className="page stack">
        <div className="segmented" style={{ alignSelf: 'flex-start' }}>
          {TABS.map((t) => (
            <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              <span className="row" style={{ gap: 6 }}>
                <Icon name={t.icon} size={15} /> {t.label}
              </span>
            </button>
          ))}
        </div>

        {tab === 'overview' && <Analytics />}

        {tab === 'list' && (
          <div className="stack">
            <FilterBar value={filters} onChange={setFilters} />

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="small muted">
                <b className="tnum" style={{ color: 'var(--ink)' }}>{filteredSum.count}</b> κινήσεις ·{' '}
                <b className="tnum" style={{ color: 'var(--ink)' }}>{money(filteredSum.total)}</b>
                {filteredSum.business > 0 && <> · επαγγελματικά {money(filteredSum.business)}</>}
                {filteredSum.vat > 0 && <> · ΦΠΑ {money(filteredSum.vat)}</>}
              </div>
              <button
                className="btn btn-sm"
                disabled={filtered.length === 0}
                onClick={() => {
                  download(`exoda-${todayISO()}.csv`, toCSV(filtered, store.categoryById), 'text/csv')
                  toast.success(`Εξήχθησαν ${filtered.length} κινήσεις σε CSV.`)
                }}
              >
                <Icon name="download" size={15} /> Εξαγωγή
              </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <ExpenseList filters={filters} />
            </div>
          </div>
        )}

        {tab === 'recurring' && <RecurringPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </div>

      {creating && <ExpenseForm startWithScan={creating.scan} onClose={() => setCreating(null)} />}
    </>
  )
}
