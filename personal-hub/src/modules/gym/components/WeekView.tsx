import { useEffect, useMemo, useRef } from 'react'
import { Icon } from '../../../ui/Icon'
import { toISO, fromISO } from '../../../core/format'
import { EXERCISE_BY_ID } from '../data/exercises'
import { cardioProtocol } from '../lib/cardio'
import { dayMinutes, mondayOf } from '../lib/generator'
import { applyWeek, todayIndex } from '../lib/progression'
import type { Plan, WorkoutLog } from '../types'
import { CARDIO_LABEL, DAY_KIND_COLOR, DAY_KIND_LABEL, WEEKDAYS_SHORT } from '../types'

/** Οι 7 μέρες της εβδομάδας ως κάρτες· κλικ για λεπτομέρειες. */
export function WeekView({ plan, week, selected, onSelect, logs }: {
  plan: Plan
  week: number
  selected: number
  onSelect: (weekday: number) => void
  logs: WorkoutLog[]
}) {
  const today = todayIndex()
  const grid = useRef<HTMLDivElement>(null)

  // Στο κινητό οι μέρες κυλάνε οριζόντια — φέρε την επιλεγμένη σε θέα.
  useEffect(() => {
    const el = grid.current?.children[selected] as HTMLElement | undefined
    const box = grid.current
    if (el && box && box.scrollWidth > box.clientWidth) box.scrollTo({ left: el.offsetLeft - box.offsetLeft - 8, behavior: 'smooth' })
  }, [selected])
  const ctx = { level: plan.profile.level, limitations: plan.profile.limitations, age: plan.profile.age }

  // Ποιες μέρες της τρέχουσας ημερολογιακής εβδομάδας έχουν ήδη καταγραφεί.
  const doneDays = useMemo(() => {
    const mon = fromISO(mondayOf(new Date()))
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    const a = toISO(mon), b = toISO(sun)
    return new Set(logs.filter((l) => l.date >= a && l.date <= b).map((l) => l.weekday))
  }, [logs])

  return (
    <div ref={grid} className="week-grid" role="tablist" aria-label="Μέρες της εβδομάδας">
      {plan.days.map((raw) => {
        const d = applyWeek(raw, week)
        const mins = dayMinutes(d)
        const isSel = selected === d.weekday
        const isToday = today === d.weekday
        return (
          <button
            key={d.weekday}
            role="tab"
            aria-selected={isSel}
            className="week-day"
            data-kind={d.kind}
            onClick={() => onSelect(d.weekday)}
          >
            <span className="row" style={{ justifyContent: 'space-between', gap: 4, flexWrap: 'nowrap' }}>
              <span className="small" style={{ fontWeight: 650, color: isToday ? 'var(--accent-ink)' : 'var(--ink-2)' }}>
                {WEEKDAYS_SHORT[d.weekday]}{isToday && ' · Σήμερα'}
              </span>
              {doneDays.has(d.weekday) && <Icon name="check" size={14} className="done-ico" />}
            </span>
            <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
              <i className="dot" style={{ background: DAY_KIND_COLOR[d.kind] }} />
              <span className="small dim" style={{ whiteSpace: 'nowrap' }}>{DAY_KIND_LABEL[d.kind]}</span>
            </span>
            <span style={{ fontWeight: 620, lineHeight: 1.25 }}>{d.title}</span>
            <span className="week-day-list small muted">
              {d.exercises.slice(0, 4).map((pe, i) => (
                <span key={i}>{EXERCISE_BY_ID.get(pe.exerciseId)?.name}</span>
              ))}
              {d.exercises.length > 4 && <span className="dim">+{d.exercises.length - 4} ακόμη</span>}
              {d.cardio.map((c, i) => (
                <span key={`c${i}`} style={{ color: 'var(--ink)' }}>
                  {CARDIO_LABEL[c.machine]} {cardioProtocol(c, ctx, week).minutes}′
                </span>
              ))}
            </span>
            {mins > 0 && <span className="small dim tnum" style={{ marginTop: 'auto' }}>~{mins} λεπτά</span>}
          </button>
        )
      })}
    </div>
  )
}
