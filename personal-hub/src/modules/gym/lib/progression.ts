import { fromISO } from '../../../core/format'
import { EXERCISE_BY_ID } from '../data/exercises'
import type { Plan, PlanDay, PlanExercise } from '../types'

/**
 * Κύκλος 4 εβδομάδων (μεσόκυκλος): βάση → περισσότερες επαναλήψεις →
 * περισσότερα σετ → αποφόρτιση. Μετά ξεκινάς ξανά με λίγο μεγαλύτερα κιλά.
 */
export const WEEKS: { n: number; label: string; hint: string }[] = [
  { n: 1, label: 'Βάση', hint: 'Βρες τα κιλά σου. Τελείωνε κάθε σετ με 2–3 επαναλήψεις «στην τσέπη».' },
  { n: 2, label: 'Επαναλήψεις', hint: 'Ίδια κιλά, +1–2 επαναλήψεις ανά σετ — ή +2,5 kg αν έφτασες το πάνω όριο.' },
  { n: 3, label: 'Όγκος', hint: '+1 σετ στις βασικές ασκήσεις. Το καρδιο γίνεται λίγο πιο απαιτητικό.' },
  { n: 4, label: 'Αποφόρτιση', hint: 'Λιγότερα σετ και ελαφρύτερη ένταση, για να «πατήσει» η πρόοδος. Μετά ξανά από την εβδ. 1.' },
]

export function currentWeek(plan: Plan, today = new Date()): number {
  const start = fromISO(plan.startDate)
  const days = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  if (days < 0) return 1
  return (Math.floor(days / 7) % 4) + 1
}

/** Πόσοι πλήρεις κύκλοι έχουν ολοκληρωθεί από την αρχή του προγράμματος. */
export function cycleNumber(plan: Plan, today = new Date()): number {
  const days = Math.floor((today.getTime() - fromISO(plan.startDate).getTime()) / 86_400_000)
  return days < 0 ? 1 : Math.floor(days / 28) + 1
}

export function applyWeek(day: PlanDay, week: number): PlanDay {
  if (week === 1) return day
  return { ...day, exercises: day.exercises.map((pe) => adjust(pe, week)) }
}

function adjust(pe: PlanExercise, week: number): PlanExercise {
  const ex = EXERCISE_BY_ID.get(pe.exerciseId)
  const compound = ex?.compound ?? false
  if (week === 3 && compound && !ex?.timed) return { ...pe, sets: Math.min(5, pe.sets + 1) }
  if (week === 4) return { ...pe, sets: Math.max(2, Math.round(pe.sets * 0.6)), rpe: 'RPE 5–6' }
  return pe
}

/** Σήμερα ως δείκτης ημέρας 0 = Δευτέρα … 6 = Κυριακή. */
export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7
