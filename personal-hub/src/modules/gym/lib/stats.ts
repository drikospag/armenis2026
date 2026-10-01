import { fromISO, toISO } from '../../../core/format'
import { mondayOf } from './generator'
import type { LoggedSet, WorkoutLog } from '../types'

const kg = (n: number) => n.toLocaleString('el-GR', { maximumFractionDigits: 1 })

const doneSets = (sets: LoggedSet[]) => sets.filter((s) => s.done && (s.reps ?? 0) > 0)

/** Η πιο πρόσφατη καταγραφή μιας άσκησης, για να ξέρεις από πού ξεκινάς. */
export function lastPerformance(logs: WorkoutLog[], exerciseId: string): { date: string; summary: string; kg: number | null; reps: number | null } | null {
  for (const log of logs) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId)
    if (!entry) continue
    const sets = doneSets(entry.sets)
    if (sets.length === 0) continue
    const top = sets.reduce((a, b) => ((b.kg ?? 0) > (a.kg ?? 0) ? b : a))
    const summary = top.kg ? `${kg(top.kg)} kg × ${top.reps} (${sets.length} σετ)` : `${sets.length} × ${top.reps}`
    return { date: log.date, summary, kg: top.kg, reps: top.reps }
  }
  return null
}

/** Εκτίμηση 1RM (τύπος Epley). */
export const e1rm = (kgv: number, reps: number) => (reps <= 1 ? kgv : kgv * (1 + reps / 30))

export function volumeOf(log: WorkoutLog): number {
  return log.entries.reduce(
    (s, e) => s + doneSets(e.sets).reduce((a, x) => a + (x.kg ?? 0) * (x.reps ?? 0), 0),
    0,
  )
}

export function cardioMinutesOf(log: WorkoutLog): number {
  return log.cardio.reduce((s, c) => s + (c.minutes || 0), 0)
}

export interface WeekBucket { key: string; label: string; sessions: number; cardio: number; volume: number }

/** Τελευταίες `n` εβδομάδες (Δευτέρα–Κυριακή), η πιο πρόσφατη τελευταία. */
export function weeklyBuckets(logs: WorkoutLog[], n = 8, today = new Date()): WeekBucket[] {
  const thisMon = fromISO(mondayOf(today))
  const out: WeekBucket[] = []
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisMon)
    start.setDate(start.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const a = toISO(start), b = toISO(end)
    const rows = logs.filter((l) => l.date >= a && l.date <= b)
    out.push({
      key: a,
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      sessions: rows.length,
      cardio: rows.reduce((s, l) => s + cardioMinutesOf(l), 0),
      volume: rows.reduce((s, l) => s + volumeOf(l), 0),
    })
  }
  return out
}

/** Συνεχόμενες εβδομάδες (ως και την τρέχουσα) που πέτυχες τον στόχο προπονήσεων. */
export function weekStreak(logs: WorkoutLog[], target: number, today = new Date()): number {
  const buckets = weeklyBuckets(logs, 52, today)
  let streak = 0
  // Η τρέχουσα εβδομάδα μετράει μόνο αν έχει ήδη πιάσει τον στόχο — αλλιώς δεν «σπάει» το σερί.
  const cur = buckets[buckets.length - 1]
  if (cur.sessions >= target) streak++
  for (let i = buckets.length - 2; i >= 0; i--) {
    if (buckets[i].sessions >= target) streak++
    else break
  }
  return streak
}

export interface PR { exerciseId: string; kg: number; reps: number; e1rm: number; date: string }

export function personalRecords(logs: WorkoutLog[]): PR[] {
  const best = new Map<string, PR>()
  for (const log of logs) {
    for (const e of log.entries) {
      for (const s of doneSets(e.sets)) {
        if (!s.kg || !s.reps) continue
        const est = e1rm(s.kg, s.reps)
        const cur = best.get(e.exerciseId)
        if (!cur || est > cur.e1rm) best.set(e.exerciseId, { exerciseId: e.exerciseId, kg: s.kg, reps: s.reps, e1rm: est, date: log.date })
      }
    }
  }
  return [...best.values()].sort((a, b) => b.e1rm - a.e1rm)
}

/** Ιστορικό εκτιμώμενου 1RM μιας άσκησης, από το παλαιότερο στο νεότερο. */
export function e1rmHistory(logs: WorkoutLog[], exerciseId: string): number[] {
  const out: number[] = []
  for (const log of [...logs].reverse()) {
    const e = log.entries.find((x) => x.exerciseId === exerciseId)
    if (!e) continue
    const vals = doneSets(e.sets).filter((s) => s.kg && s.reps).map((s) => e1rm(s.kg!, s.reps!))
    if (vals.length) out.push(Math.max(...vals))
  }
  return out
}

export const formatKg = kg
