import { useMemo, useState } from 'react'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { EXERCISE_BY_ID } from '../data/exercises'
import { EQUIPMENT_BY_ID } from '../data/equipment'
import { dayMinutes } from '../lib/generator'
import { applyWeek } from '../lib/progression'
import { lastPerformance } from '../lib/stats'
import { useGym } from '../store'
import type { Plan } from '../types'
import { DAY_KIND_COLOR, DAY_KIND_LABEL, MUSCLE_LABEL, WEEKDAYS } from '../types'
import { CardioCard } from './CardioCard'
import { DoseEditor } from './DoseEditor'
import { EquipmentArt } from './EquipmentArt'
import { ExercisePicker } from './ExercisePicker'

export function DayDetail({ plan, weekday, week, onStart }: {
  plan: Plan
  weekday: number
  week: number
  onStart: () => void
}) {
  const store = useGym()
  const toast = useToast()
  const base = plan.days[weekday]
  const day = useMemo(() => applyWeek(base, week), [base, week])
  const ctx = { level: plan.profile.level, limitations: plan.profile.limitations, age: plan.profile.age }
  const [open, setOpen] = useState<number | null>(null)
  const [picker, setPicker] = useState<null | { replace?: number }>(null)
  const minutes = dayMinutes(day)
  // Αρίθμηση των ενοτήτων με τη σειρά που εμφανίζονται.
  let step = 0
  const next = () => ++step

  return (
    <div className="card">
      <div className="card-head" style={{ flexWrap: 'wrap' }}>
        <div className="grow">
          <div className="row" style={{ gap: 8 }}>
            <i className="dot" style={{ background: DAY_KIND_COLOR[day.kind] }} />
            <span className="small dim">{WEEKDAYS[weekday]} · {DAY_KIND_LABEL[day.kind]}</span>
          </div>
          <div className="h2" style={{ marginTop: 2 }}>{day.title}</div>
          {day.focus.length > 0 && (
            <div className="small muted">{day.focus.map((m) => MUSCLE_LABEL[m]).join(' · ')}</div>
          )}
        </div>
        {minutes > 0 && (
          <span className="badge tnum"><Icon name="timer" size={13} /> ~{minutes}′</span>
        )}
        {day.kind !== 'rest' && (
          <button className="btn btn-primary no-print" onClick={onStart}>
            <Icon name="play" size={15} /> Ξεκίνα
          </button>
        )}
      </div>

      <div className="card-pad stack" style={{ gap: 20 }}>
        {day.kind === 'rest' && (
          <Block title="Σήμερα ξεκουράζεσαι" icon="moon">
            <p className="muted small">
              Η πρόοδος γίνεται όταν ξεκουράζεσαι, όχι όταν προπονείσαι. Αν θέλεις κίνηση, ένας ήπιος περίπατος
              είναι αρκετός.
            </p>
            <ul className="list">{day.cooldown.map((c) => <li key={c}>{c}</li>)}</ul>
            <button className="btn btn-sm no-print" style={{ alignSelf: 'flex-start' }} onClick={() => setPicker({})}>
              <Icon name="plus" size={14} /> Πρόσθεσε άσκηση
            </button>
          </Block>
        )}

        {(day.warmup || day.mobility.length > 0) && (
          <Block title="Ζέσταμα" icon="flame" step={next()}>
            {day.warmup && <CardioCard block={day.warmup} ctx={ctx} week={week} compact />}
            {day.mobility.length > 0 && (
              <div className="stack" style={{ gap: 4 }}>
                <span className="small" style={{ fontWeight: 600 }}>Κινητικότητα</span>
                <ul className="list">{day.mobility.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}
          </Block>
        )}

        {(day.exercises.length > 0 || day.kind === 'workout' || day.kind === 'cardio') && (
          <Block title={day.kind === 'cardio' ? 'Κορμός' : 'Κυρίως πρόγραμμα'} icon="dumbbell" step={next()}>
            <div className="stack" style={{ gap: 8 }}>
              {day.exercises.map((pe, i) => {
                const ex = EXERCISE_BY_ID.get(pe.exerciseId)
                if (!ex) return null
                const last = lastPerformance(store.logs, ex.id)
                const mainEq = ex.eq[0]?.split('|')[0]
                const isOpen = open === i
                return (
                  <div key={`${pe.exerciseId}-${i}`} className="ex-row">
                    <button className="ex-main" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                      <span className="ex-num tnum">{i + 1}</span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'block', fontWeight: 600 }}>{ex.name}</span>
                        <span className="small dim" style={{ display: 'block' }}>
                          {ex.en}
                          {equipmentNote(ex.eq)}
                        </span>
                      </span>
                      <span className="ex-dose tnum">
                        <b>{pe.sets} × {pe.reps}{pe.kg ? ` · ${pe.kg} kg` : ''}</b>
                        <span className="small dim">{pe.restSec}″ διάλ. · {pe.rpe}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ex-more">
                        {mainEq && (
                          <div style={{ maxWidth: 240 }}>
                            <EquipmentArt id={mainEq} photo={store.photos[mainEq]} label={EQUIPMENT_BY_ID.get(mainEq)?.name ?? ''} />
                          </div>
                        )}
                        <ul className="list">{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul>
                        <div className="small muted">
                          Μύες: {MUSCLE_LABEL[ex.primary]}
                          {ex.secondary?.length ? `, ${ex.secondary.map((m) => MUSCLE_LABEL[m]).join(', ')}` : ''}
                        </div>
                        {last && (
                          <div className="small muted">
                            Τελευταία φορά ({last.date.split('-').reverse().join('/')}): <b className="tnum">{last.summary}</b>
                          </div>
                        )}
                        <div className="no-print stack" style={{ gap: 4 }}>
                          <DoseEditor
                            pe={base.exercises[i] ?? pe}
                            timed={ex.timed}
                            idPrefix={`day-${weekday}-${i}`}
                            onChange={(patch) => void store.updateExercise(weekday, i, patch)}
                          />
                          {week > 2 && <span className="small dim">Ορίζεις τη βάση· στην εβδομάδα {week} τα σετ προσαρμόζονται αυτόματα.</span>}
                        </div>
                        <div className="row no-print" style={{ gap: 6 }}>
                          <button className="btn btn-sm" onClick={() => setPicker({ replace: i })}>
                            <Icon name="refresh" size={14} /> Αλλαγή
                          </button>
                          <button className="btn btn-sm btn-ghost" disabled={i === 0} onClick={() => { void store.moveExercise(weekday, i, -1); setOpen(i - 1) }} aria-label="Πάνω">
                            <Icon name="up" size={14} />
                          </button>
                          <button className="btn btn-sm btn-ghost" disabled={i === day.exercises.length - 1} onClick={() => { void store.moveExercise(weekday, i, 1); setOpen(i + 1) }} aria-label="Κάτω">
                            <Icon name="down" size={14} />
                          </button>
                          <span style={{ flex: 1 }} />
                          <button className="btn btn-sm btn-ghost" onClick={() => { void store.removeExercise(weekday, i); setOpen(null) }}>
                            <Icon name="trash" size={14} /> Αφαίρεση
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <button className="btn btn-sm no-print" style={{ alignSelf: 'flex-start' }} onClick={() => setPicker({})}>
                <Icon name="plus" size={14} /> Προσθήκη άσκησης
              </button>
            </div>
          </Block>
        )}

        {day.cardio.length > 0 && (
          <Block title={day.kind === 'active' ? 'Ανάκαμψη' : 'Καρδιο'} icon="run" step={next()}>
            {day.cardio.map((c, i) => <CardioCard key={i} block={c} ctx={ctx} week={week} />)}
          </Block>
        )}

        {day.kind !== 'rest' && day.cooldown.length > 0 && (
          <Block title="Αποθεραπεία" icon="heart" step={next()}>
            <ul className="list">{day.cooldown.map((c) => <li key={c}>{c}</li>)}</ul>
          </Block>
        )}
      </div>

      {picker && (
        <ExercisePicker
          profile={plan.profile}
          replacing={picker.replace != null ? day.exercises[picker.replace]?.exerciseId : undefined}
          onClose={() => setPicker(null)}
          onPick={(id) => {
            const name = EXERCISE_BY_ID.get(id)?.name
            if (picker.replace != null) {
              void store.swapExercise(weekday, picker.replace, id)
              toast.success(`Μπήκε: ${name}`)
            } else {
              void store.addExercise(weekday, id)
              toast.success(`Προστέθηκε: ${name}`)
            }
            setPicker(null)
          }}
        />
      )}
    </div>
  )
}

/** Ο εξοπλισμός, εκτός αν είναι ένα μόνο μηχάνημα — τότε το λέει ήδη το όνομα της άσκησης. */
function equipmentNote(eq: string[]): string {
  const items = eq.map((g) => EQUIPMENT_BY_ID.get(g.split('|')[0]))
  if (items.length === 0) return ' · Χωρίς εξοπλισμό'
  if (items.length === 1 && items[0]?.cat === 'machine') return ''
  return ` · ${eq.map((g) => g.split('|').map((id) => EQUIPMENT_BY_ID.get(id)?.name ?? id).join(' ή ')).join(' + ')}`
}

function Block({ title, icon, step, children }: { title: string; icon: string; step?: number; children: React.ReactNode }) {
  return (
    <section className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 8 }}>
        <Icon name={icon} size={16} className="dim" />
        <span className="h3" style={{ color: 'var(--ink-2)' }}>{step ? `${step}. ` : ''}{title}</span>
      </div>
      {children}
    </section>
  )
}
