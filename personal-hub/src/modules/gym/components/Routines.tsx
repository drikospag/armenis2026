import { useState } from 'react'
import { ConfirmDialog, EmptyState, Modal } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { uid } from '../../../core/id'
import { EXERCISE_BY_ID } from '../data/exercises'
import { EQUIPMENT_BY_ID } from '../data/equipment'
import { ROUTINE_TEMPLATES, buildRoutine, exerciseMinutes, prescribe } from '../lib/generator'
import { todayIndex } from '../lib/progression'
import { useGym } from '../store'
import type { PlanDay, PlanExercise, Plan, Routine } from '../types'
import { MUSCLE_LABEL, WEEKDAYS } from '../types'
import { DoseEditor } from './DoseEditor'
import { EquipmentArt } from './EquipmentArt'
import { ExercisePicker } from './ExercisePicker'
import { SessionLogger } from './SessionLogger'

/** Τα δικά σου προγράμματα ανά μυϊκή ομάδα: σειρά ασκήσεων, σετ, επαναλήψεις, διάλειμμα, κιλά. */
export function Routines({ plan }: { plan: Plan }) {
  const store = useGym()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const current = store.routines.find((r) => r.id === editing)
  if (current) return <RoutineEditor plan={plan} routine={current} onBack={() => setEditing(null)} />

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
        <div className="small muted" style={{ maxWidth: 560 }}>
          Φτιάξε προγράμματα για κάθε μυϊκή ομάδα, όπως «Πόδια», «Πλάτη», «Στήθος». Ορίζεις τη σειρά των ασκήσεων,
          τα σετ, τις επαναλήψεις, το διάλειμμα και τα κιλά, και τα βάζεις σε όποια μέρα θέλεις.
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" size={16} /> Νέο πρόγραμμα
        </button>
      </div>

      {store.routines.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="dumbbell"
            title="Δεν έχεις δικά σου προγράμματα ακόμη"
            hint="Διάλεξε μυϊκή ομάδα και η εφαρμογή θα το γεμίσει με ασκήσεις για τα μηχανήματα και το επίπεδό σου. Μετά το αλλάζεις όπως θέλεις."
            action={<button className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="plus" size={16} /> Νέο πρόγραμμα</button>}
          />
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {store.routines.map((r) => <RoutineCard key={r.id} routine={r} onOpen={() => setEditing(r.id)} />)}
        </div>
      )}

      {creating && (
        <NewRoutine
          plan={plan}
          onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); setEditing(id) }}
        />
      )}
    </div>
  )
}

function routineMinutes(r: Routine): number {
  return Math.round(r.exercises.reduce((s, pe) => s + exerciseMinutes(pe), 0) + 12)
}

function RoutineCard({ routine, onOpen }: { routine: Routine; onOpen: () => void }) {
  const { photos } = useGym()
  const first = EXERCISE_BY_ID.get(routine.exercises[0]?.exerciseId ?? '')
  const eq = first?.eq[0]?.split('|')[0]
  const sets = routine.exercises.reduce((s, pe) => s + pe.sets, 0)
  return (
    <button className="card" onClick={onOpen} style={{ textAlign: 'left', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {eq ? (
        <EquipmentArt id={eq} photo={photos[eq]} label={EQUIPMENT_BY_ID.get(eq)?.name ?? ''} />
      ) : (
        <span className="eq-art eq-art-md" />
      )}
      <span className="card-pad stack" style={{ gap: 6 }}>
        <b style={{ fontSize: '1.05rem' }}>{routine.name}</b>
        <span className="small dim">{routine.exercises.length} ασκήσεις · {sets} σετ · ~{routineMinutes(routine)}′</span>
        <span className="small muted">
          {routine.exercises.slice(0, 3).map((pe) => EXERCISE_BY_ID.get(pe.exerciseId)?.name).join(' → ')}
          {routine.exercises.length > 3 ? ' …' : ''}
        </span>
      </span>
    </button>
  )
}

function NewRoutine({ plan, onClose, onCreated }: { plan: Plan; onClose: () => void; onCreated: (id: string) => void }) {
  const store = useGym()
  return (
    <Modal title="Νέο πρόγραμμα" subtitle="Διάλεξε μυϊκή ομάδα. Θα γεμίσει με ασκήσεις για τον εξοπλισμό σου." onClose={onClose} width={620}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
        {[...ROUTINE_TEMPLATES, { id: 'custom', label: 'Κενό', hint: 'Βάζεις μόνος σου τις ασκήσεις' }].map((t) => (
          <button
            key={t.id}
            className="eq-tile"
            style={{ padding: 12, gap: 4 }}
            onClick={() => {
              const now = Date.now()
              const r: Routine = {
                id: uid('rt'),
                name: t.id === 'custom' ? 'Νέο πρόγραμμα' : t.label,
                template: t.id,
                exercises: t.id === 'custom' ? [] : buildRoutine(t.id, plan.profile),
                createdAt: now,
                updatedAt: now,
              }
              void store.saveRoutine(r).then(() => onCreated(r.id))
            }}
          >
            <b>{t.label}</b>
            <span className="small dim" style={{ fontWeight: 400 }}>{t.hint}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

function RoutineEditor({ plan, routine, onBack }: { plan: Plan; routine: Routine; onBack: () => void }) {
  const store = useGym()
  const toast = useToast()
  const [picker, setPicker] = useState<null | { replace?: number }>(null)
  const [assign, setAssign] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [running, setRunning] = useState(false)
  const [name, setName] = useState(routine.name)

  const save = (patch: Partial<Routine>) => store.saveRoutine({ ...routine, ...patch })
  const setExercises = (fn: (list: PlanExercise[]) => PlanExercise[]) => save({ exercises: fn(routine.exercises) })
  const move = (i: number, dir: -1 | 1) =>
    setExercises((list) => {
      const j = i + dir
      if (j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const asDay: PlanDay = {
    weekday: todayIndex(), kind: 'workout', title: routine.name, focus: [], mobility: [],
    exercises: routine.exercises, cardio: [], cooldown: [],
  }
  const muscles = [...new Set(routine.exercises.map((pe) => EXERCISE_BY_ID.get(pe.exerciseId)?.primary).filter(Boolean))]

  return (
    <div className="stack">
      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-sm btn-ghost" onClick={onBack}><Icon name="left" size={15} /> Όλα τα προγράμματα</button>
      </div>

      <div className="card card-pad stack" style={{ gap: 12 }}>
        <label className="field">
          <span className="label">Όνομα προγράμματος</span>
          <input
            id="routine-name" className="input" style={{ fontSize: '1.15rem', fontWeight: 620 }} value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { const v = name.trim() || 'Πρόγραμμα'; setName(v); if (v !== routine.name) void save({ name: v }) }}
          />
        </label>
        <div className="row small muted" style={{ gap: 14 }}>
          <span><b className="tnum" style={{ color: 'var(--ink)' }}>{routine.exercises.length}</b> ασκήσεις</span>
          <span><b className="tnum" style={{ color: 'var(--ink)' }}>{routine.exercises.reduce((s, pe) => s + pe.sets, 0)}</b> σετ</span>
          <span>~<b className="tnum" style={{ color: 'var(--ink)' }}>{routineMinutes(routine)}</b> λεπτά με ζέσταμα</span>
          {muscles.length > 0 && <span>{muscles.map((m) => MUSCLE_LABEL[m!]).join(' · ')}</span>}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-primary" disabled={routine.exercises.length === 0} onClick={() => setRunning(true)}>
            <Icon name="play" size={15} /> Ξεκίνα τώρα
          </button>
          <button className="btn" disabled={routine.exercises.length === 0} onClick={() => setAssign(true)}>
            <Icon name="calendar" size={15} /> Βάλε σε μέρα
          </button>
          <button
            className="btn"
            onClick={() => {
              const now = Date.now()
              void store.saveRoutine({ ...routine, id: uid('rt'), name: `${routine.name} (αντίγραφο)`, createdAt: now, updatedAt: now })
              toast.success('Δημιουργήθηκε αντίγραφο.')
            }}
          >
            <Icon name="copy" size={15} /> Αντίγραφο
          </button>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={15} /> Διαγραφή</button>
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="h3">Σειρά ασκήσεων</div>
        {routine.exercises.length === 0 && <div className="small dim">Πρόσθεσε την πρώτη άσκηση.</div>}
        {routine.exercises.map((pe, i) => {
          const ex = EXERCISE_BY_ID.get(pe.exerciseId)
          if (!ex) return null
          const eq = ex.eq[0]?.split('|')[0]
          return (
            <div key={`${pe.exerciseId}-${i}`} className="routine-ex">
              <span className="ex-num tnum">{i + 1}</span>
              <div className="stack" style={{ gap: 10, minWidth: 0 }}>
                <div className="row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                  {eq && <EquipmentArt id={eq} photo={store.photos[eq]} size="sm" label={EQUIPMENT_BY_ID.get(eq)?.name ?? ''} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block' }}>{ex.name}</b>
                    <span className="small dim">{ex.en} · {MUSCLE_LABEL[ex.primary]}</span>
                  </div>
                  <div className="row" style={{ gap: 2, flexWrap: 'nowrap' }}>
                    <button className="btn btn-sm btn-ghost btn-icon" disabled={i === 0} onClick={() => void move(i, -1)} aria-label="Πιο πάνω"><Icon name="up" size={15} /></button>
                    <button className="btn btn-sm btn-ghost btn-icon" disabled={i === routine.exercises.length - 1} onClick={() => void move(i, 1)} aria-label="Πιο κάτω"><Icon name="down" size={15} /></button>
                  </div>
                </div>
                <DoseEditor
                  pe={pe}
                  timed={ex.timed}
                  idPrefix={`rt-${routine.id}-${i}`}
                  onChange={(patch) => void setExercises((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                />
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => setPicker({ replace: i })}><Icon name="refresh" size={14} /> Αλλαγή άσκησης</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => void setExercises((list) => list.filter((_, j) => j !== i))}>
                    <Icon name="trash" size={14} /> Αφαίρεση
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => setPicker({})}>
          <Icon name="plus" size={15} /> Προσθήκη άσκησης
        </button>
      </div>

      {picker && (
        <ExercisePicker
          profile={plan.profile}
          replacing={picker.replace != null ? routine.exercises[picker.replace]?.exerciseId : undefined}
          onClose={() => setPicker(null)}
          onPick={(id) => {
            const ex = EXERCISE_BY_ID.get(id)
            if (!ex) return
            if (picker.replace != null) {
              const idx = picker.replace
              // Κράτα τη δοσολογία που είχες ορίσει, αλλάζει μόνο η άσκηση.
              void setExercises((list) => list.map((x, j) => (j === idx ? { ...x, exerciseId: id, kg: null } : x)))
            } else {
              void setExercises((list) => [...list, prescribe(ex, plan.profile.goal, plan.profile.level)])
            }
            setPicker(null)
          }}
        />
      )}

      {assign && (
        <Modal title="Σε ποια μέρα;" subtitle="Η μέρα θα πάρει αυτές τις ασκήσεις. Το ζέσταμα και το καρδιο της μένουν." onClose={() => setAssign(false)} width={420}>
          <div className="stack" style={{ gap: 6 }}>
            {plan.days.map((d) => (
              <button
                key={d.weekday}
                className="lib-row"
                style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)' }}
                onClick={() => {
                  void store.assignRoutine(routine.id, d.weekday)
                  setAssign(false)
                  toast.success(`${WEEKDAYS[d.weekday]}: ${routine.name}`)
                }}
              >
                <b style={{ width: 90 }}>{WEEKDAYS[d.weekday]}</b>
                <span className="small dim" style={{ flex: 1 }}>τώρα: {d.title}</span>
                <Icon name="right" size={15} className="dim" />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Διαγραφή προγράμματος"
          message={`Το «${routine.name}» θα διαγραφεί. Οι μέρες στις οποίες το έβαλες κρατούν τις ασκήσεις τους.`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { void store.deleteRoutine(routine.id); onBack() }}
        />
      )}

      {running && (
        <SessionLogger
          profile={plan.profile}
          day={asDay}
          weekday={todayIndex()}
          week={1}
          routineId={routine.id}
          onClose={() => setRunning(false)}
        />
      )}
    </div>
  )
}
