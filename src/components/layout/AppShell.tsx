'use client'
import { BottomNav } from './BottomNav'
import { ToastProvider } from '@/components/ui/toast'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <main className="max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
