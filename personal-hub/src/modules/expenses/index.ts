import type { AppModule } from '../../core/types'
import { ExpensesPage } from './ExpensesPage'

export const expensesModule: AppModule = {
  id: 'expenses',
  name: 'Έξοδα',
  description: 'Καθημερινά έξοδα, σάρωση αποδείξεων, πάγια και ιστορικό ανά μήνα/έτος.',
  icon: 'wallet',
  group: 'Οικονομικά',
  Page: ExpensesPage,
}
