import type { ComponentType, ReactNode } from 'react'

/** Ένα module του hub. Πρόσθεσε καινούργιο module στο `src/core/registry.ts`. */
export interface AppModule {
  /** Σταθερό id — χρησιμοποιείται στο URL hash και στις ρυθμίσεις. */
  id: string
  /** Όνομα στο μενού. */
  name: string
  /** Μία γραμμή περιγραφής (settings / dashboard). */
  description: string
  /** Εικονίδιο από το `src/ui/Icon.tsx`. */
  icon: string
  /** Το component της σελίδας. */
  Page: ComponentType
  /** Προαιρετικό widget για το dashboard. */
  Widget?: ComponentType
  /** Ομάδα στο πλαϊνό μενού. */
  group?: string
}

export type ThemeChoice = 'system' | 'light' | 'dark'

export interface ToastMessage {
  id: string
  kind: 'info' | 'success' | 'error'
  text: ReactNode
}
