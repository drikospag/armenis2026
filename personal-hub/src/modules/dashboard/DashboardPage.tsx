import { Icon } from '../../ui/Icon'
import { navigate } from '../../core/router'
import { MONTHS_EL } from '../../core/format'
import { ExpensesWidget } from '../expenses/ExpensesWidget'
import { MODULES } from '../../core/registry'

export function DashboardPage() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 5 ? 'Καλό ξημέρωμα' : hour < 12 ? 'Καλημέρα' : hour < 18 ? 'Καλησπέρα' : 'Καλό βράδυ'
  const others = MODULES.filter((m) => m.id !== 'dashboard' && m.id !== 'expenses')

  return (
    <>
      <div className="topbar">
        <div className="grow">
          <div className="h1">{greeting}</div>
          <div className="small dim">
            {now.getDate()} {MONTHS_EL[now.getMonth()]} {now.getFullYear()}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('expenses')}>
          <Icon name="plus" size={16} /> Νέο έξοδο
        </button>
      </div>

      <div className="page stack">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
          <ExpensesWidget onOpen={() => navigate('expenses')} />

          <div className="card">
            <div className="card-head">
              <div className="grow">
                <div className="h2">Τα modules σου</div>
                <div className="small dim">Το hub μεγαλώνει όσο προσθέτεις κομμάτια.</div>
              </div>
            </div>
            <div className="card-pad stack" style={{ gap: 10 }}>
              {MODULES.filter((m) => m.id !== 'dashboard').map((m) => (
                <button
                  key={m.id}
                  className="row"
                  onClick={() => navigate(m.id)}
                  style={{
                    gap: 12, textAlign: 'left', width: '100%', padding: 12,
                    border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface)',
                  }}
                >
                  <span
                    style={{
                      width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center',
                      background: 'var(--accent-wash)', color: 'var(--accent-ink)',
                    }}
                  >
                    <Icon name={m.icon} size={18} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 600 }}>{m.name}</span>
                    <span className="small dim" style={{ display: 'block' }}>{m.description}</span>
                  </span>
                  <Icon name="right" size={16} className="dim" />
                </button>
              ))}

              {others.length === 0 && (
                <div className="small dim" style={{ padding: '4px 2px' }}>
                  Θέλεις κι άλλο module (σημειώσεις, συνήθειες, ταξίδια…); Αντίγραψε τον φάκελο{' '}
                  <code>src/modules/_template</code> και δήλωσέ το στο <code>src/core/registry.ts</code>.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
