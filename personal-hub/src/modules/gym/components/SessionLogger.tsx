import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { useToast } from '../../../ui/Toast'
import { todayISO } from '../../../core/format'
import { EXERCISE_BY_ID } from '../data/exercises'
import { cardioProtocol } from '../lib/cardio'
import { lastPerformance } from '../lib/stats'
import { useGym } from '../store'
import type { CardioLog, LogEntry, PlanDay, Profile } from '../types'
import { CARDIO_LABEL, WEEKDAYS } from '../types'

const FEEL = ['Πολύ εύκολη', 'Εύκολη', 'Κανονική', 'Δύσκολη', 'Εξαντλητική']

/** Καταγραφή προπόνησης: κιλά/επαναλήψεις ανά σετ, χρονόμετρο διαλείμματος, καρδιο. */
export function SessionLogger({ profile, day, weekday, week, routineId, onClose }: {
  profile: Profile
  /** Η μέρα με την πρόοδο της εβδομάδας ήδη εφαρμοσμένη — ή ένα δικό σου πρόγραμμα. */
  day: PlanDay
  weekday: number
  week: number
  routineId?: string
  onClose: () => void
}) {
  const store = useGym()
  const toast = useToast()
  const ctx = { level: profile.level, limitations: profile.limitations, age: profile.age }

  const [date, setDate] = useState(todayISO())
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    day.exercises.map((pe) => {
      const last = lastPerformance(store.logs, pe.exerciseId)
      return {
        exerciseId: pe.exerciseId,
        target: `${pe.sets} × ${pe.reps}`,
        sets: Array.from({ length: pe.sets }, () => ({ kg: last?.kg ?? pe.kg ?? null, reps: null, done: false })),
      }
    }),
  )
  const [cardio, setCardio] = useState<CardioLog[]>(() =>
    day.cardio.map((c) => ({ machine: c.machine, minutes: cardioProtocol(c, ctx, week).minutes, km: null })),
  )
  const [feel, setFeel] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  // Χρονόμετρα: συνολικός χρόνος και αντίστροφη μέτρηση διαλείμματος.
  const started = useRef(Date.now())
  const [now, setNow] = useState(Date.now())
  const [restUntil, setRestUntil] = useState<number | null>(null)
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const restLeft = restUntil ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0
  useEffect(() => {
    if (restUntil && restLeft === 0) {
      setRestUntil(null)
      try { navigator.vibrate?.([200, 100, 200]) } catch { /* δεν υποστηρίζεται */ }
    }
  }, [restLeft, restUntil])

  const elapsed = Math.floor((now - started.current) / 1000)
  const doneCount = entries.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0)
  const totalSets = entries.reduce((s, e) => s + e.sets.length, 0)

  const patchSet = (ei: number, si: number, patch: Partial<LogEntry['sets'][number]>) =>
    setEntries((cur) => cur.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) })))

  const toggleDone = (ei: number, si: number) => {
    const s = entries[ei].sets[si]
    const pe = day.exercises[ei]
    const next = !s.done
    // Αν δεν γράφτηκαν επαναλήψεις, πάρε το κάτω όριο του στόχου.
    const reps = s.reps ?? (parseInt(pe.reps, 10) || null)
    patchSet(ei, si, { done: next, reps })
    if (next) setRestUntil(Date.now() + pe.restSec * 1000)
  }

  async function save() {
    const minutes = Math.max(1, Math.round(elapsed / 60))
    await store.saveLog({
      date,
      week,
      weekday,
      title: day.title,
      entries: entries.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })).filter((e) => e.sets.length > 0),
      cardio: cardio.filter((c) => c.minutes > 0),
      durationMin: minutes,
      feel,
      notes: notes.trim(),
      routineId,
    })
    toast.success('Η προπόνηση καταγράφηκε. Μπράβο!')
    onClose()
  }

  const nothing = doneCount === 0 && cardio.every((c) => !c.minutes)

  return (
    <Modal
      title={day.title}
      subtitle={routineId ? 'Δικό σου πρόγραμμα' : `${WEEKDAYS[weekday]} · εβδομάδα ${week} του κύκλου`}
      onClose={onClose}
      width={760}
      footer={
        <>
          <span className="small dim tnum" style={{ marginRight: 'auto' }}>
            {doneCount}/{totalSets} σετ · {fmtClock(elapsed)}
          </span>
          <button className="btn" onClick={onClose}>Άκυρο</button>
          <button className="btn btn-primary" disabled={nothing} onClick={() => void save()}>
            <Icon name="check" size={16} /> Αποθήκευση
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        {restUntil && (
          <div className="rest-bar" role="timer" aria-live="polite">
            <Icon name="timer" size={18} />
            <span style={{ flex: 1 }}>Διάλειμμα</span>
            <b className="tnum" style={{ fontSize: '1.25rem' }}>{fmtClock(restLeft)}</b>
            <button className="btn btn-sm" onClick={() => setRestUntil((r) => (r ? r + 30_000 : r))}>+30″</button>
            <button className="btn btn-sm" onClick={() => setRestUntil(null)}>Παράλειψη</button>
          </div>
        )}

        <label className="field" style={{ maxWidth: 200 }}>
          <span className="label">Ημερομηνία</span>
          <input className="input" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value || todayISO())} />
        </label>

        {entries.map((e, ei) => {
          const ex = EXERCISE_BY_ID.get(e.exerciseId)
          const pe = day.exercises[ei]
          const last = lastPerformance(store.logs, e.exerciseId)
          return (
            <div key={ei} className="stack" style={{ gap: 6 }}>
              <div className="row" style={{ justifyContent: 'space-between', gap: 6 }}>
                <b>{ex?.name}</b>
                <span className="small muted tnum">Στόχος {pe.sets} × {pe.reps} · {pe.restSec}″</span>
              </div>
              {last && <span className="small dim">Τελευταία: {last.summary}</span>}
              <div className="set-grid">
                <span className="small dim">Σετ</span>
                <span className="small dim">kg</span>
                <span className="small dim">{ex?.timed ? 'Δευτ.' : 'Επαν.'}</span>
                <span />
                {e.sets.map((s, si) => (
                  <SetRow
                    key={si}
                    n={si + 1}
                    kg={s.kg}
                    reps={s.reps}
                    done={s.done}
                    placeholder={pe.reps}
                    onKg={(v) => patchSet(ei, si, { kg: v })}
                    onReps={(v) => patchSet(ei, si, { reps: v })}
                    onDone={() => toggleDone(ei, si)}
                  />
                ))}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setEntries((cur) => cur.map((x, i) => (i === ei ? { ...x, sets: [...x.sets, { ...x.sets[x.sets.length - 1], done: false }] } : x)))}
                >
                  <Icon name="plus" size={13} /> Σετ
                </button>
                {e.sets.length > 1 && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setEntries((cur) => cur.map((x, i) => (i === ei ? { ...x, sets: x.sets.slice(0, -1) } : x)))}
                  >
                    <Icon name="minus" size={13} /> Σετ
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {cardio.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="h3">Καρδιο</div>
            {cardio.map((c, i) => (
              <div key={i} className="row" style={{ gap: 8 }}>
                <span style={{ minWidth: 150, fontWeight: 560 }}>{CARDIO_LABEL[c.machine]}</span>
                <label className="row small" style={{ gap: 6 }}>
                  <input
                    className="input tnum" type="number" min={0} inputMode="numeric" style={{ width: 80 }}
                    value={c.minutes || ''} onChange={(ev) => setCardio((cur) => cur.map((x, j) => (j === i ? { ...x, minutes: Number(ev.target.value) || 0 } : x)))}
                  />
                  λεπτά
                </label>
                <label className="row small" style={{ gap: 6 }}>
                  <input
                    className="input tnum" type="number" min={0} step={0.1} inputMode="decimal" style={{ width: 80 }} placeholder="—"
                    value={c.km ?? ''} onChange={(ev) => setCardio((cur) => cur.map((x, j) => (j === i ? { ...x, km: ev.target.value ? Number(ev.target.value) : null } : x)))}
                  />
                  km
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <span className="label">Πώς ήταν;</span>
          <div className="segmented">
            {FEEL.map((f, i) => (
              <button key={f} aria-pressed={feel === i + 1} onClick={() => setFeel(feel === i + 1 ? null : i + 1)}>{f}</button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="label">Σημειώσεις</span>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="π.χ. ανέβασα κιλά στην πρέσα, ενόχληση στον ώμο…" />
        </label>
      </div>
    </Modal>
  )
}

function SetRow({ n, kg, reps, done, placeholder, onKg, onReps, onDone }: {
  n: number
  kg: number | null
  reps: number | null
  done: boolean
  placeholder: string
  onKg: (v: number | null) => void
  onReps: (v: number | null) => void
  onDone: () => void
}) {
  return (
    <>
      <span className="tnum" style={{ fontWeight: 600, color: done ? 'var(--good-text)' : undefined }}>{n}</span>
      <input
        className="input tnum" type="number" min={0} step={0.5} inputMode="decimal" placeholder="—"
        value={kg ?? ''} onChange={(e) => onKg(e.target.value ? Number(e.target.value) : null)}
      />
      <input
        className="input tnum" type="number" min={0} inputMode="numeric" placeholder={placeholder}
        value={reps ?? ''} onChange={(e) => onReps(e.target.value ? Number(e.target.value) : null)}
      />
      <button
        className={done ? 'btn btn-sm btn-primary btn-icon' : 'btn btn-sm btn-icon'}
        onClick={onDone}
        aria-pressed={done}
        aria-label={done ? `Σετ ${n} ολοκληρώθηκε` : `Ολοκλήρωση σετ ${n}`}
      >
        <Icon name="check" size={15} />
      </button>
    </>
  )
}

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
