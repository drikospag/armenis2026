'use client'
import * as React from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={cn(
      'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
      'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg',
      'animate-in slide-in-from-bottom-4 duration-300',
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    )}>
      {type === 'success'
        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
        : <XCircle className="w-5 h-5 shrink-0" />
      }
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastState {
  message: string
  type: 'success' | 'error'
  id: number
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = React.createContext<ToastContextValue>({ showToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const showToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { message, type, id }])
  }, [])

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}
