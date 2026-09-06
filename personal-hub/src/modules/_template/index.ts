import type { AppModule } from '../../core/types'
import { TemplatePage } from './Page'

export const templateModule: AppModule = {
  id: 'template',
  name: 'Πρότυπο',
  description: 'Αντίγραψέ με για να φτιάξεις νέο module.',
  icon: 'sparkles',
  Page: TemplatePage,
}
