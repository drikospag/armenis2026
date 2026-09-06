const EUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
const EUR0 = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const NUM = new Intl.NumberFormat('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const PCT = new Intl.NumberFormat('el-GR', { style: 'percent', maximumFractionDigits: 1 })

export const money = (n: number) => EUR.format(n || 0)
export const money0 = (n: number) => EUR0.format(n || 0)
export const num = (n: number) => NUM.format(n || 0)
export const pct = (n: number) => PCT.format(n || 0)

/** Συμπαγής μορφή για μεγάλα νούμερα σε άξονες: 1,2κ € · 12,4κ € */
export function compactEur(n: number): string {
  const a = Math.abs(n)
  if (a >= 1000) return `${NUM.format(n / 1000).replace(/,00$/, '')}κ €`
  return `${Math.round(n)} €`
}

export const MONTHS_EL = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
export const MONTHS_EL_SHORT = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ']

/** 'YYYY-MM-DD' της σημερινής (τοπικής) ημέρας. */
export function todayISO(): string {
  return toISO(new Date())
}
export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
/** Ασφαλές parse του 'YYYY-MM-DD' ως τοπική ημερομηνία (όχι UTC). */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
export const monthKey = (iso: string) => iso.slice(0, 7)
export const yearOf = (iso: string) => Number(iso.slice(0, 4))
export const monthOf = (iso: string) => Number(iso.slice(5, 7))

export function formatDate(iso: string): string {
  const d = fromISO(iso)
  return `${d.getDate()} ${MONTHS_EL_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
export function formatDateLong(iso: string): string {
  const d = fromISO(iso)
  return `${d.getDate()} ${MONTHS_EL[d.getMonth()]} ${d.getFullYear()}`
}
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS_EL[m - 1]} ${y}`
}
export function relativeDay(iso: string): string | null {
  const today = todayISO()
  if (iso === today) return 'Σήμερα'
  const y = new Date()
  y.setDate(y.getDate() - 1)
  if (iso === toISO(y)) return 'Χθες'
  return null
}
/** Στρογγυλοποίηση σε 2 δεκαδικά χωρίς σφάλματα κινητής υποδιαστολής. */
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
