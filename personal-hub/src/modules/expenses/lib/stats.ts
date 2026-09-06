import { MONTHS_EL_SHORT, monthKey, round2, yearOf } from '../../../core/format'
import { SERIES_VARS } from '../../../ui/charts'
import type { Category, Expense, Kind } from '../types'
import { vatFromGross } from './recurring'

export interface Filters {
  kind: Kind | 'all'
  categoryIds: string[]
  search: string
  from?: string
  to?: string
  paymentMethod?: string
  onlyWithReceipt?: boolean
}

export const EMPTY_FILTERS: Filters = { kind: 'all', categoryIds: [], search: '' }

export function applyFilters(rows: Expense[], f: Filters, categoryById: Map<string, Category>): Expense[] {
  const q = f.search.trim().toLocaleLowerCase('el-GR')
  return rows.filter((e) => {
    if (f.kind !== 'all' && e.kind !== f.kind) return false
    if (f.categoryIds.length && !f.categoryIds.includes(e.categoryId)) return false
    if (f.from && e.date < f.from) return false
    if (f.to && e.date > f.to) return false
    if (f.paymentMethod && e.paymentMethod !== f.paymentMethod) return false
    if (f.onlyWithReceipt && !e.receiptId) return false
    if (q) {
      const hay = [
        e.merchant, e.notes ?? '', e.docNumber ?? '', e.taxId ?? '',
        categoryById.get(e.categoryId)?.name ?? '', String(e.amount),
      ].join(' ').toLocaleLowerCase('el-GR')
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export interface Summary {
  total: number
  business: number
  personal: number
  vat: number
  count: number
  average: number
  largest?: Expense
}

export function summarize(rows: Expense[]): Summary {
  let total = 0, business = 0, personal = 0, vat = 0
  let largest: Expense | undefined
  for (const e of rows) {
    total += e.amount
    if (e.kind === 'business') {
      business += e.amount
      vat += e.vatAmount ?? (e.vatRate ? vatFromGross(e.amount, e.vatRate) : 0)
    } else {
      personal += e.amount
    }
    if (!largest || e.amount > largest.amount) largest = e
  }
  return {
    total: round2(total),
    business: round2(business),
    personal: round2(personal),
    vat: round2(vat),
    count: rows.length,
    average: rows.length ? round2(total / rows.length) : 0,
    largest,
  }
}

/** Σύνολα ανά μήνα για ένα έτος (12 σημεία, ακόμη κι αν λείπουν μήνες). */
export function monthlySeries(rows: Expense[], year: number) {
  const points = MONTHS_EL_SHORT.map((label, i) => ({
    key: `${year}-${String(i + 1).padStart(2, '0')}`,
    label,
    values: { business: 0, personal: 0 } as Record<string, number>,
  }))
  for (const e of rows) {
    if (yearOf(e.date) !== year) continue
    const idx = Number(e.date.slice(5, 7)) - 1
    points[idx].values[e.kind] = round2(points[idx].values[e.kind] + e.amount)
  }
  return points
}

/** Σύνολα ανά έτος. */
export function yearlySeries(rows: Expense[]) {
  const map = new Map<number, Record<string, number>>()
  for (const e of rows) {
    const y = yearOf(e.date)
    const cur = map.get(y) ?? { business: 0, personal: 0 }
    cur[e.kind] = round2(cur[e.kind] + e.amount)
    map.set(y, cur)
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, values]) => ({ key: String(y), label: String(y), values }))
}

/** Ημερήσια σύνολα ενός μήνα ('YYYY-MM'). */
export function dailySeries(rows: Expense[], month: string) {
  const [y, m] = month.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  const points = Array.from({ length: days }, (_, i) => ({
    key: `${month}-${String(i + 1).padStart(2, '0')}`,
    label: i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : '',
    values: { business: 0, personal: 0 } as Record<string, number>,
  }))
  for (const e of rows) {
    if (monthKey(e.date) !== month) continue
    const d = Number(e.date.slice(8, 10)) - 1
    if (points[d]) points[d].values[e.kind] = round2(points[d].values[e.kind] + e.amount)
  }
  return points
}

export interface Ranked { id: string; label: string; value: number; color: string; count: number }

/** Κατάταξη ανά κατηγορία, με τα υπόλοιπα να συμπτύσσονται σε «Λοιπά». */
export function rankByCategory(rows: Expense[], categoryById: Map<string, Category>, limit = 8): Ranked[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const e of rows) {
    const cur = map.get(e.categoryId) ?? { value: 0, count: 0 }
    cur.value = round2(cur.value + e.amount)
    cur.count++
    map.set(e.categoryId, cur)
  }
  const all = [...map.entries()]
    .map(([id, v]) => ({
      id,
      label: categoryById.get(id)?.name ?? 'Χωρίς κατηγορία',
      value: v.value,
      count: v.count,
      color: SERIES_VARS[(categoryById.get(id)?.colorIndex ?? 0) % SERIES_VARS.length],
    }))
    .sort((a, b) => b.value - a.value)

  if (all.length <= limit) return all
  const head = all.slice(0, limit - 1)
  const tail = all.slice(limit - 1)
  head.push({
    id: '__other__',
    label: `Λοιπές (${tail.length})`,
    value: round2(tail.reduce((s, t) => s + t.value, 0)),
    count: tail.reduce((s, t) => s + t.count, 0),
    color: 'var(--line-strong)',
  })
  return head
}

/** Κατάταξη ανά κατάστημα/προμηθευτή. */
export function rankByMerchant(rows: Expense[], limit = 6): Ranked[] {
  const map = new Map<string, { value: number; count: number }>()
  for (const e of rows) {
    const name = (e.merchant || '—').trim()
    const cur = map.get(name) ?? { value: 0, count: 0 }
    cur.value = round2(cur.value + e.amount)
    cur.count++
    map.set(name, cur)
  }
  return [...map.entries()]
    .map(([id, v]) => ({ id, label: id, value: v.value, count: v.count, color: 'var(--seq-400)' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/** Τα έτη που υπάρχουν δεδομένα (φθίνουσα σειρά), πάντα με το τρέχον έτος μέσα. */
export function availableYears(rows: Expense[]): number[] {
  const set = new Set(rows.map((e) => yearOf(e.date)))
  set.add(new Date().getFullYear())
  return [...set].sort((a, b) => b - a)
}

/** Ποσοστιαία μεταβολή (null όταν δεν υπάρχει βάση σύγκρισης). */
export function change(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}
