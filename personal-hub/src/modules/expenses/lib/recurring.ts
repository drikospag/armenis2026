import { fromISO, round2, toISO, todayISO } from '../../../core/format'
import { uid } from '../../../core/id'
import type { Expense, Recurring } from '../types'
import { FREQUENCY_MONTHS } from '../types'

/** Προσθέτει μήνες κρατώντας την ημέρα (με clamp: 31 Ιαν + 1 μήνας → 28/29 Φεβ). */
export function addMonths(iso: string, months: number): string {
  const d = fromISO(iso)
  const day = d.getDate()
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return toISO(target)
}

/** Όλες οι ημερομηνίες χρέωσης ενός πάγιου μέχρι και το `until`. */
export function occurrencesUntil(r: Recurring, until: string): string[] {
  const stepMonths = FREQUENCY_MONTHS[r.frequency]
  const out: string[] = []
  let cur = r.startDate
  let guard = 0
  while (cur <= until && guard++ < 600) {
    if (r.endDate && cur > r.endDate) break
    out.push(cur)
    cur = addMonths(r.startDate, stepMonths * out.length)
  }
  return out
}

/** Η επόμενη ημερομηνία χρέωσης (ή null αν το πάγιο έχει λήξει). */
export function nextOccurrence(r: Recurring, from = todayISO()): string | null {
  const stepMonths = FREQUENCY_MONTHS[r.frequency]
  let cur = r.startDate
  let i = 0
  while (i++ < 600) {
    if (r.endDate && cur > r.endDate) return null
    if (cur >= from) return cur
    cur = addMonths(r.startDate, stepMonths * i)
  }
  return null
}

/** Ετησιοποιημένο κόστος ενός πάγιου, για συγκρίσεις. */
export function annualCost(r: Recurring): number {
  return round2((r.amount * 12) / FREQUENCY_MONTHS[r.frequency])
}

/**
 * Δημιουργεί τις εγγραφές εξόδων για κάθε χρέωση πάγιου που έχει ήδη περάσει
 * και δεν έχει καταγραφεί. Είναι idempotent: τρέχει όσες φορές θέλεις.
 */
export function generateDue(
  recurring: Recurring[],
  existing: Expense[],
  today = todayISO(),
): { created: Expense[]; updatedRecurring: Recurring[] } {
  const seen = new Set(existing.filter((e) => e.recurringId).map((e) => `${e.recurringId}|${e.date}`))
  const created: Expense[] = []
  const updatedRecurring: Recurring[] = []
  const now = Date.now()

  for (const r of recurring) {
    if (!r.active) continue
    let last = r.lastGenerated
    let touched = false
    for (const date of occurrencesUntil(r, today)) {
      const key = `${r.id}|${date}`
      if (seen.has(key)) continue
      seen.add(key)
      created.push({
        id: uid('e'),
        date,
        amount: round2(r.amount),
        kind: r.kind,
        categoryId: r.categoryId,
        merchant: r.merchant || r.label,
        paymentMethod: r.paymentMethod,
        vatRate: r.vatRate,
        vatAmount: r.vatRate ? vatFromGross(r.amount, r.vatRate) : undefined,
        notes: r.notes,
        recurringId: r.id,
        source: 'recurring',
        createdAt: now,
        updatedAt: now,
      })
      if (!last || date > last) { last = date; touched = true }
    }
    if (touched) updatedRecurring.push({ ...r, lastGenerated: last, updatedAt: now })
  }

  return { created, updatedRecurring }
}

/** ΦΠΑ που περιέχεται σε ποσό με ΦΠΑ. */
export function vatFromGross(gross: number, rate: number): number {
  if (!rate) return 0
  return round2(gross - gross / (1 + rate / 100))
}
/** Καθαρή αξία από ποσό με ΦΠΑ. */
export function netFromGross(gross: number, rate: number): number {
  return round2(gross - vatFromGross(gross, rate))
}
