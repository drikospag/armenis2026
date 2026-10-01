import { Icon } from '../../ui/Icon'
import { EXERCISE_BY_ID } from './data/exercises'
import { cardioProtocol } from './lib/cardio'
import { dayMinutes } from './lib/generator'
import { WEEKS, applyWeek, currentWeek, todayIndex } from './lib/progression'
import { weeklyBuckets } from './lib/stats'
import { GymProvider, useGym } from './store'
import { CARDIO_LABEL, DAY_KIND_COLOR, DAY_KIND_LABEL } from './types'

/** Η σημερινή προπόνηση για την αρχική σελίδα. */
export function GymWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <GymProvider>
      <Inner onOpen={onOpen} />
    </GymProvider>
  )
}

function Inner({ onOpen }: { onOpen: () => void }) {
  const store = useGym()
  if (!store.ready) return <div className="card card-pad dim">Φόρτωση…</div>

  const plan = store.plan
  if (!plan) {
    return (
      <div className="card">
        <div className="card-head">
          <div className="grow"><div className="h2">Γυμναστήριο</div></div>
        </div>
        <div className="card-pad stack" style={{ gap: 10 }}>
          <div className="small muted">Δεν έχεις πρόγραμμα ακόμη. Σε ένα λεπτό φτιάχνεις εβδομαδιαίο πρόγραμμα με μηχανήματα και διάδρομο.</div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={onOpen}>
            <Icon name="sparkles" size={15} /> Φτιάξε πρόγραμμα
          </button>
        </div>
      </div>
    )
  }

  const week = currentWeek(plan)
  const day = applyWeek(plan.days[todayIndex()], week)
  const ctx = { level: plan.profile.level, limitations: plan.profile.limitations, age: plan.profile.age }
  const thisWeek = weeklyBuckets(store.logs, 1)[0]
  const target = plan.profile.days.length

  return (
    <div className="card">
      <div className="card-head">
        <div className="grow">
          <div className="h2">Σήμερα στο γυμναστήριο</div>
          <div className="small dim">Εβδομάδα {week} · {WEEKS[week - 1].label} · {thisWeek.sessions}/{target} προπονήσεις</div>
        </div>
        <button className="btn btn-sm" onClick={onOpen}>Άνοιγμα <Icon name="right" size={15} /></button>
      </div>
      <div className="card-pad stack" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <i className="dot" style={{ background: DAY_KIND_COLOR[day.kind] }} />
          <span className="small dim">{DAY_KIND_LABEL[day.kind]}</span>
          {dayMinutes(day) > 0 && <span className="small dim">· ~{dayMinutes(day)}′</span>}
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 640, letterSpacing: '-0.02em' }}>{day.title}</div>
        {day.exercises.length > 0 && (
          <div className="stack" style={{ gap: 4 }}>
            {day.exercises.slice(0, 5).map((pe, i) => (
              <div key={i} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{EXERCISE_BY_ID.get(pe.exerciseId)?.name}</span>
                <span className="tnum dim" style={{ whiteSpace: 'nowrap' }}>{pe.sets} × {pe.reps}</span>
              </div>
            ))}
            {day.exercises.length > 5 && <span className="small dim">+{day.exercises.length - 5} ακόμη</span>}
          </div>
        )}
        {day.cardio.map((c, i) => (
          <div key={i} className="row small" style={{ gap: 6 }}>
            <Icon name="run" size={14} className="dim" />
            {CARDIO_LABEL[c.machine]} · {cardioProtocol(c, ctx, week).minutes}′
          </div>
        ))}
      </div>
    </div>
  )
}
