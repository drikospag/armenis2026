import { useEffect, useState } from 'react'
import type { PlanExercise } from '../types'

const RESTS = [30, 45, 60, 75, 90, 120, 150, 180, 240]

/** Σετ, επαναλήψεις, διάλειμμα και κιλά-στόχος μιας άσκησης. */
export function DoseEditor({ pe, timed = false, idPrefix, onChange }: {
  pe: PlanExercise
  timed?: boolean
  idPrefix: string
  onChange: (patch: Partial<PlanExercise>) => void
}) {
  // Οι επαναλήψεις είναι ελεύθερο κείμενο (π.χ. «8–12»)· αποθηκεύονται όταν φύγεις από το πεδίο.
  const [reps, setReps] = useState(pe.reps)
  useEffect(() => setReps(pe.reps), [pe.reps])

  return (
    <div className="dose">
      <label className="field">
        <span className="label">Σετ</span>
        <input
          id={`${idPrefix}-sets`} className="input tnum" type="number" min={1} max={10} inputMode="numeric"
          value={pe.sets} onChange={(e) => onChange({ sets: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
        />
      </label>
      <label className="field">
        <span className="label">{timed ? 'Χρόνος' : 'Επαναλήψεις'}</span>
        <input
          id={`${idPrefix}-reps`} className="input tnum" value={reps} placeholder={timed ? '30″' : '8–12'}
          onChange={(e) => setReps(e.target.value)}
          onBlur={() => { const v = reps.trim().replace(/(\d)\s*-\s*(\d)/, '$1–$2'); if (v && v !== pe.reps) onChange({ reps: v }) }}
        />
      </label>
      <label className="field">
        <span className="label">Διάλειμμα</span>
        <select
          id={`${idPrefix}-rest`} className="select tnum" value={pe.restSec}
          onChange={(e) => onChange({ restSec: Number(e.target.value) })}
        >
          {[...new Set([...RESTS, pe.restSec])].sort((a, b) => a - b).map((r) => (
            <option key={r} value={r}>{r < 60 ? `${r}″` : `${Math.floor(r / 60)}′${r % 60 ? ` ${r % 60}″` : ''}`}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">Κιλά (στόχος)</span>
        <input
          id={`${idPrefix}-kg`} className="input tnum" type="number" min={0} step={0.5} inputMode="decimal" placeholder="—"
          value={pe.kg ?? ''} onChange={(e) => onChange({ kg: e.target.value ? Number(e.target.value) : null })}
        />
      </label>
    </div>
  )
}
