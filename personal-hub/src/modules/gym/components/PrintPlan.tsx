import { EXERCISE_BY_ID } from '../data/exercises'
import { cardioProtocol, formatDuration } from '../lib/cardio'
import { SPLIT_NAME, dayMinutes } from '../lib/generator'
import { WEEKS, applyWeek } from '../lib/progression'
import type { Plan } from '../types'
import { DAY_KIND_LABEL, GOAL_LABEL, LEVEL_LABEL, WEEKDAYS } from '../types'

/** Όλη η εβδομάδα σε μορφή για χαρτί — εμφανίζεται μόνο στην εκτύπωση. */
export function PrintPlan({ plan, week }: { plan: Plan; week: number }) {
  const ctx = { level: plan.profile.level, limitations: plan.profile.limitations, age: plan.profile.age }
  const w = WEEKS[week - 1]
  return (
    <div className="print-only">
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Πρόγραμμα γυμναστηρίου — Εβδομάδα {week}: {w.label}</h1>
      <p style={{ fontSize: 12, marginBottom: 12 }}>
        {LEVEL_LABEL[plan.profile.level]} · {GOAL_LABEL[plan.profile.goal]} · {SPLIT_NAME(plan.profile.days.length, plan.profile.level, plan.profile.goal)} · {w.hint}
      </p>
      {plan.days.map((raw) => {
        const d = applyWeek(raw, week)
        return (
          <div key={d.weekday} className="print-day">
            <h2 style={{ fontSize: 15, margin: '10px 0 4px' }}>
              {WEEKDAYS[d.weekday]} — {d.title} <span style={{ fontWeight: 400 }}>({DAY_KIND_LABEL[d.kind]}{dayMinutes(d) ? `, ~${dayMinutes(d)}′` : ''})</span>
            </h2>
            {d.warmup && (
              <p style={{ fontSize: 12 }}>
                <b>Ζέσταμα:</b> {cardioProtocol(d.warmup, ctx, week).segments.map((s) => `${formatDuration(s.sec)} ${s.setting}`).join(' → ')}
                {d.mobility.length > 0 && ` · ${d.mobility.join(' · ')}`}
              </p>
            )}
            {d.exercises.length > 0 && (
              <table className="print-table">
                <thead><tr><th>#</th><th>Άσκηση</th><th>Σετ × Επαν.</th><th>Διάλ.</th><th>Ένταση</th><th>kg / σημειώσεις</th></tr></thead>
                <tbody>
                  {d.exercises.map((pe, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{EXERCISE_BY_ID.get(pe.exerciseId)?.name}</td>
                      <td>{pe.sets} × {pe.reps}</td>
                      <td>{pe.restSec}″</td>
                      <td>{pe.rpe}</td>
                      <td style={{ width: '28%' }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {d.cardio.map((c, i) => {
              const p = cardioProtocol(c, ctx, week)
              return (
                <p key={i} style={{ fontSize: 12 }}>
                  <b>{p.title} ({p.minutes}′):</b>{' '}
                  {p.segments.map((s) => `${s.repeat ? `${s.repeat}× ` : ''}${s.label} ${formatDuration(s.sec)} [${s.setting}]${s.rest ? ` + ${formatDuration(s.rest.sec)} [${s.rest.setting}]` : ''}`).join(' → ')}
                </p>
              )
            })}
            {d.kind !== 'rest' && d.cooldown.length > 0 && <p style={{ fontSize: 12 }}><b>Αποθεραπεία:</b> {d.cooldown.join(' · ')}</p>}
          </div>
        )
      })}
    </div>
  )
}
