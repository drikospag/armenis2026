import type { AppModule } from '../../core/types'
import { DashboardPage } from './DashboardPage'

export const dashboardModule: AppModule = {
  id: 'dashboard',
  name: 'Αρχική',
  description: 'Μια ματιά σε ό,τι τρέχει σήμερα.',
  icon: 'grid',
  Page: DashboardPage,
}
