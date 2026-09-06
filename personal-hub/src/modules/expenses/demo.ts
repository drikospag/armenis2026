/**
 * Δείγμα δεδομένων για την έκδοση επίδειξης (η σελίδα που ανοίγει με ένα κλικ).
 * Δεν φορτώνεται ποτέ στην τοπική εγκατάσταση — μπαίνει μόνο όταν το build
 * επίδειξης έχει ορίσει το `window.__PH_DEMO__`.
 */
import { round2, toISO } from '../../core/format'
import { uid } from '../../core/id'
import type { Expense, Recurring } from './types'

export const isDemo = (): boolean =>
  typeof window !== 'undefined' && (window as { __PH_DEMO__?: boolean }).__PH_DEMO__ === true

interface Template {
  merchant: string
  categoryId: string
  kind: 'business' | 'personal'
  min: number
  max: number
  /** Περίπου κάθε πόσες μέρες εμφανίζεται. */
  every: number
}

const TEMPLATES: Template[] = [
  { merchant: 'Σκλαβενίτης',        categoryId: 'p-market',    kind: 'personal', min: 18,  max: 74, every: 4 },
  { merchant: 'Καφέ Μελί',          categoryId: 'p-eatout',    kind: 'personal', min: 3,   max: 12, every: 3 },
  { merchant: 'Ταβέρνα Ο Πλάτανος', categoryId: 'p-eatout',    kind: 'personal', min: 22,  max: 58, every: 12 },
  { merchant: 'ΟΑΣΑ',               categoryId: 'p-transport', kind: 'personal', min: 9,   max: 30, every: 15 },
  { merchant: 'Φαρμακείο Δήμου',    categoryId: 'p-health',    kind: 'personal', min: 6,   max: 42, every: 18 },
  { merchant: 'ΔΕΗ',                categoryId: 'p-bills',     kind: 'personal', min: 58,  max: 145, every: 30 },
  { merchant: 'Public',             categoryId: 'p-fun',       kind: 'personal', min: 12,  max: 46, every: 25 },

  { merchant: 'Shell',              categoryId: 'b-travel',    kind: 'business', min: 40,  max: 90, every: 7 },
  { merchant: 'Microsoft 365',      categoryId: 'b-software',  kind: 'business', min: 12,  max: 12, every: 30 },
  { merchant: 'Πλαίσιο',            categoryId: 'b-equipment', kind: 'business', min: 35,  max: 260, every: 26 },
  { merchant: 'Hotel Egnatia',      categoryId: 'b-hotel',     kind: 'business', min: 65,  max: 130, every: 34 },
  { merchant: 'Γεύμα με πελάτη',    categoryId: 'b-meals',     kind: 'business', min: 28,  max: 85, every: 11 },
  { merchant: 'Cosmote Business',   categoryId: 'b-telecom',   kind: 'business', min: 42,  max: 42, every: 30 },
  { merchant: 'Λογιστικό Γραφείο',  categoryId: 'b-services',  kind: 'business', min: 150, max: 150, every: 90 },
]

/** Ψευδοτυχαίο αλλά σταθερό, ώστε το δείγμα να μοιάζει ίδιο σε κάθε άνοιγμα. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** ~14 μήνες ιστορικού, ώστε να έχουν νόημα και η μηνιαία και η ετήσια εικόνα. */
export function demoExpenses(days = 430): Expense[] {
  const rows: Expense[] = []
  const today = new Date()
  let n = 0

  for (let back = 0; back < days; back++) {
    const d = new Date(today)
    d.setDate(today.getDate() - back)
    const date = toISO(d)

    for (const t of TEMPLATES) {
      n++
      if (Math.floor(back / t.every) * t.every !== back - (n % 2)) continue
      const r = seeded(n)
      if (r > 0.86) continue
      const amount = round2(t.min + r * (t.max - t.min))
      const vatRate = t.kind === 'business' ? 24 : undefined
      rows.push({
        id: uid('demo'),
        date,
        amount,
        kind: t.kind,
        categoryId: t.categoryId,
        merchant: t.merchant,
        paymentMethod: r > 0.7 ? 'cash' : r > 0.25 ? 'card' : 'bank',
        vatRate,
        vatAmount: vatRate ? round2(amount - amount / 1.24) : undefined,
        source: 'manual',
        createdAt: Date.now() - back * 86400000,
        updatedAt: Date.now() - back * 86400000,
      })
    }
  }
  return rows
}

export function demoRecurring(): Recurring[] {
  const now = Date.now()
  const year = new Date().getFullYear()
  const base = { active: true, createdAt: now, updatedAt: now }
  return [
    { ...base, id: 'demo-rc1', label: 'Ασφάλεια αυτοκινήτου', amount: 340, kind: 'personal', categoryId: 'p-transport', merchant: 'Ασφαλιστική', paymentMethod: 'bank', frequency: 'yearly', startDate: `${year - 1}-04-10` },
    { ...base, id: 'demo-rc2', label: 'ΕΝΦΙΑ', amount: 520, kind: 'personal', categoryId: 'p-housing', merchant: 'ΑΑΔΕ', paymentMethod: 'bank', frequency: 'yearly', startDate: `${year - 1}-09-30` },
    { ...base, id: 'demo-rc3', label: 'Adobe Creative Cloud', amount: 29.9, kind: 'business', categoryId: 'b-software', merchant: 'Adobe', paymentMethod: 'card', frequency: 'monthly', startDate: `${year - 1}-01-05`, vatRate: 24 },
    { ...base, id: 'demo-rc4', label: 'Ασφαλιστικές εισφορές', amount: 235, kind: 'business', categoryId: 'b-insurance', merchant: 'ΕΦΚΑ', paymentMethod: 'bank', frequency: 'bimonthly', startDate: `${year - 1}-02-28` },
  ]
}
