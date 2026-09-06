import { useEffect, useMemo } from 'react'
import { Icon } from './ui/Icon'
import { ToastProvider } from './ui/Toast'
import { MODULES, findModule } from './core/registry'
import { navigate, useRoute } from './core/router'
import { useTheme } from './core/theme'

export default function App() {
  const route = useRoute()
  const active = useMemo(() => findModule(route), [route])
  const [theme, , cycleTheme] = useTheme()

  useEffect(() => {
    document.title = active.id === 'dashboard' ? 'Personal Hub' : `${active.name} · Personal Hub`
  }, [active])

  const groups = useMemo(() => {
    const map = new Map<string, typeof MODULES>()
    for (const m of MODULES) {
      const key = m.group ?? ''
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return [...map.entries()]
  }, [])

  const Page = active.Page

  return (
    <ToastProvider>
      <div className="app">
        <nav className="sidebar" aria-label="Κύρια πλοήγηση">
          <div className="brand">
            <span className="brand-mark">PH</span>
            <span className="brand-name">Personal Hub</span>
          </div>

          {groups.map(([group, mods]) => (
            <div key={group || 'root'}>
              {group && <div className="nav-section h3">{group}</div>}
              {mods.map((m) => (
                <button
                  key={m.id}
                  className="nav-item"
                  aria-current={m.id === active.id ? 'page' : undefined}
                  onClick={() => navigate(m.id)}
                >
                  <Icon name={m.icon} size={18} className="ico" />
                  {m.name}
                </button>
              ))}
            </div>
          ))}

          <div className="nav-spacer" />

          <button className="nav-item" onClick={cycleTheme}>
            <Icon name={theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'grid'} size={18} className="ico" />
            {theme === 'system' ? 'Θέμα: αυτόματο' : theme === 'light' ? 'Θέμα: φωτεινό' : 'Θέμα: σκούρο'}
          </button>
          <div className="small dim" style={{ padding: '6px 10px' }}>
            Τα δεδομένα μένουν σε αυτόν τον υπολογιστή.
          </div>
        </nav>

        <main className="main">
          <Page />
        </main>

        <nav className="mobile-nav" aria-label="Πλοήγηση">
          {MODULES.map((m) => (
            <button key={m.id} aria-current={m.id === active.id ? 'page' : undefined} onClick={() => navigate(m.id)}>
              <Icon name={m.icon} size={20} />
              {m.name}
            </button>
          ))}
          <button onClick={cycleTheme} aria-label="Εναλλαγή θέματος">
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} />
            Θέμα
          </button>
        </nav>
      </div>
    </ToastProvider>
  )
}
