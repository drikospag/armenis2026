import type { AppModule } from './types'
import { dashboardModule } from '../modules/dashboard'
import { expensesModule } from '../modules/expenses'

/**
 * Το μητρώο των modules.
 *
 * Για νέο module:
 *   1. Αντίγραψε το `src/modules/_template` σε `src/modules/<το-όνομά-σου>`.
 *   2. Γράψε τη σελίδα σου στο `Page`.
 *   3. Πρόσθεσέ το εδώ.
 * Η πλοήγηση, το URL (`#/<id>`) και η κάρτα στην αρχική προκύπτουν αυτόματα.
 */
export const MODULES: AppModule[] = [
  dashboardModule,
  expensesModule,
]

export function findModule(id: string): AppModule {
  return MODULES.find((m) => m.id === id) ?? MODULES[0]
}
