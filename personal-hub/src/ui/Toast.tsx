import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { uid } from '../core/id'
import type { ToastMessage } from '../core/types'

interface ToastApi {
  push: (text: ReactNode, kind?: ToastMessage['kind']) => void
  success: (text: ReactNode) => void
  error: (text: ReactNode) => void
}

const Ctx = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([])
  const timers = useRef<Record<string, number>>({})

  const remove = useCallback((id: string) => {
    setItems((cur) => cur.filter((t) => t.id !== id))
    window.clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const push = useCallback(
    (text: ReactNode, kind: ToastMessage['kind'] = 'info') => {
      const id = uid('t')
      setItems((cur) => [...cur.slice(-3), { id, kind, text }])
      timers.current[id] = window.setTimeout(() => remove(id), kind === 'error' ? 6000 : 3400)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({ push, success: (t) => push(t, 'success'), error: (t) => push(t, 'error') }),
    [push],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="toast" data-kind={t.kind}>
            <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'success' ? 'check' : 'info'} size={17} />
            <span style={{ flex: 1 }}>{t.text}</span>
            <button className="btn-ghost" onClick={() => remove(t.id)} aria-label="Κλείσιμο">
              <Icon name="close" size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast χρειάζεται <ToastProvider>')
  return ctx
}
