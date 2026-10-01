import type { AppModule } from '../../core/types'
import { GymPage } from './GymPage'

export const gymModule: AppModule = {
  id: 'gym',
  name: 'Γυμναστήριο',
  description: 'Εβδομαδιαίο πρόγραμμα με μηχανήματα, επίπεδα, διάδρομο και καταγραφή προόδου.',
  icon: 'dumbbell',
  group: 'Υγεία',
  Page: GymPage,
}
