import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../../ui/components'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { formatDate } from '../../core/format'
import { isDemo } from '../expenses/demo'
import { cardioProtocol } from './lib/cardio'
import { SPLIT_NAME, dayMinutes } from './lib/generator'
import { WEEKS, applyWeek, currentWeek, cycleNumber, todayIndex } from './lib/progression'
import { GymProvider, useGym } from './store'
import { DayDetail } from './components/DayDetail'
import { History } from './components/History'
import { Library } from './components/Library'
import { Routines } from './components/Routines'
import { PrintPlan } from './components/PrintPlan'
import { SessionLogger } from './components/SessionLogger'
import { WeekView } from './components/WeekView'
import { Wizard } from './components/Wizard'
import type { Plan, Profile } from './types'
import { GOAL_LABEL, LEVEL_LABEL } from './types'

type Tab = 'plan' | 'routines' | 'library' | 'history' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'plan', label: 'Εβδομάδα', icon: 'calendar' },
  { id: 'routines', label: 'Τα προγράμματά μου', icon: 'list' },
  { id: 'library', label: 'Μηχανήματα', icon: 'dumbbell' },
  { id: 'history', label: 'Πρόοδος', icon: 'trend' },
  { id: 'profile', label: 'Προφίλ', icon: 'settings' },
]

export function GymPage() {
  return (
    <GymProvider>
      <GymInner />
    </GymProvider>
  )
}

function GymInner() {
  const store = useGym()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('plan')
  const [confirm, setConfirm] = useState<null | { kind: 'reshuffle' } | { kind: 'replace'; profile: Profile } | { kind: 'delete' } | { kind: 'wipe' }>(null)

  if (!store.ready) return <div className="page dim">Φόρτωση…</div>

  const plan = store.plan

  return (
    <>
      <div className="topbar">
        <div className="grow">
          <div className="h1">Γυμναστήριο</div>
          <div className="small dim">Εβδομαδιαίο πρόγραμμα με βάρη, μηχανήματα και διάδρομο — φτιαγμένο για σένα.</div>
        </div>
        {plan && tab === 'plan' && (
          <>
            {/* Η σελίδα επίδειξης τρέχει σε πλαίσιο που δεν επιτρέπει εκτύπωση. */}
            {!isDemo() && (
              <button className="btn" onClick={() => window.print()} title="Εκτύπωση εβδομάδας" aria-label="Εκτύπωση">
              <Icon name="print" size={16} /> <span className="hide-sm">Εκτύπωση</span>
            </button>
            )}
            <button className="btn" onClick={() => setConfirm({ kind: 'reshuffle' })} title="Ίδιο προφίλ, άλλες ασκήσεις" aria-label="Νέα παραλλαγή">
              <Icon name="refresh" size={16} /> <span className="hide-sm">Παραλλαγή</span>
            </button>
          </>
        )}
      </div>

      <div className="page stack">
        {plan && (
          <div className="segmented no-print" style={{ alignSelf: 'flex-start' }}>
            {TABS.map((t) => (
              <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                <span className="row" style={{ gap: 6 }}><Icon name={t.icon} size={15} /> {t.label}</span>
              </button>
            ))}
          </div>
        )}

        {!plan && (
          <Onboarding
            onCreate={(p) => void store.createPlan(p).then(() => {
              scrollTop()
              toast.success('Το πρόγραμμά σου είναι έτοιμο!')
            })}
          />
        )}

        {plan && tab === 'plan' && <PlanTab plan={plan} />}
        {plan && tab === 'routines' && <Routines plan={plan} />}
        {plan && tab === 'library' && <Library profile={plan.profile} />}
        {plan && tab === 'history' && <History />}
        {plan && tab === 'profile' && (
          <div className="stack">
            <div className="card card-pad stack" style={{ gap: 10 }}>
              <div className="h2">Το πρόγραμμά σου</div>
              <div className="small muted">
                Δημιουργήθηκε {formatDate(new Date(plan.createdAt).toISOString().slice(0, 10))} · κύκλος {cycleNumber(plan)}, εβδομάδα {currentWeek(plan)} από 4.
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-sm" onClick={() => { void store.restartCycle(); toast.success('Ο κύκλος ξεκινά από την εβδομάδα 1.') }}>
                  <Icon name="repeat" size={14} /> Νέος κύκλος από αυτή την εβδομάδα
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirm({ kind: 'delete' })}>
                  <Icon name="trash" size={14} /> Διαγραφή προγράμματος
                </button>
                {store.logs.length > 0 && (
                  <button className="btn btn-sm btn-danger" onClick={() => setConfirm({ kind: 'wipe' })}>
                    <Icon name="trash" size={14} /> Διαγραφή ιστορικού
                  </button>
                )}
              </div>
            </div>
            <Wizard
              initial={plan.profile}
              submitLabel="Νέο πρόγραμμα με αυτές τις ρυθμίσεις"
              onSubmit={(p) => setConfirm({ kind: 'replace', profile: p })}
            />
          </div>
        )}
      </div>

      {plan && <PrintPlan plan={plan} week={currentWeek(plan)} />}

      {confirm?.kind === 'reshuffle' && (
        <ConfirmDialog
          title="Νέα παραλλαγή;"
          message="Ίδιες ρυθμίσεις και ίδια δομή εβδομάδας, αλλά με άλλες ασκήσεις όπου υπάρχουν εναλλακτικές. Οι αλλαγές που έκανες με το χέρι θα χαθούν· το ιστορικό μένει."
          confirmLabel="Ναι, νέα παραλλαγή"
          danger={false}
          onCancel={() => setConfirm(null)}
          onConfirm={() => { void store.reshuffle(); setConfirm(null); toast.success('Νέα παραλλαγή προγράμματος.') }}
        />
      )}
      {confirm?.kind === 'replace' && (
        <ConfirmDialog
          title="Αντικατάσταση προγράμματος;"
          message="Θα φτιαχτεί νέο πρόγραμμα με τις νέες ρυθμίσεις και ο κύκλος θα ξεκινήσει από την εβδομάδα 1. Το ιστορικό προπονήσεων μένει."
          confirmLabel="Φτιάξε το"
          danger={false}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            void store.createPlan(confirm.profile).then(() => { setTab('plan'); scrollTop(); toast.success('Νέο πρόγραμμα έτοιμο.') })
            setConfirm(null)
          }}
        />
      )}
      {confirm?.kind === 'delete' && (
        <ConfirmDialog
          title="Διαγραφή προγράμματος"
          message="Το πρόγραμμα θα διαγραφεί και θα ξεκινήσεις από την αρχή. Το ιστορικό προπονήσεων μένει."
          onCancel={() => setConfirm(null)}
          onConfirm={() => { void store.deletePlan(); setConfirm(null); setTab('plan') }}
        />
      )}
      {confirm?.kind === 'wipe' && (
        <ConfirmDialog
          title="Διαγραφή ιστορικού"
          message={`Θα διαγραφούν οριστικά ${store.logs.length} καταγεγραμμένες προπονήσεις.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => { void store.wipeLogs(); setConfirm(null) }}
        />
      )}
    </>
  )
}

/** Το περιεχόμενο κυλάει μέσα στο `.main`, όχι στο window. */
const scrollTop = () => document.querySelector('.main')?.scrollTo({ top: 0 })

function Onboarding({ onCreate }: { onCreate: (p: Profile) => void }) {
  return (
    <div className="stack">
      <div className="card card-pad stack" style={{ gap: 8, background: 'var(--accent-wash)', borderColor: 'transparent' }}>
        <div className="h2" style={{ color: 'var(--accent-ink)' }}>Ας φτιάξουμε το πρόγραμμά σου</div>
        <div className="small muted">
          Πες μας επίπεδο, στόχο, πόσες μέρες μπορείς και τι μηχανήματα έχει το γυμναστήριό σου. Θα πάρεις πλήρες
          εβδομαδιαίο πρόγραμμα με ζέσταμα, ασκήσεις με σετ/επαναλήψεις, πρωτόκολλα διαδρόμου και αποθεραπεία,
          σε κύκλο 4 εβδομάδων με σταδιακή πρόοδο. Όλα αλλάζουν μετά με ένα κλικ.
        </div>
      </div>
      <Wizard onSubmit={onCreate} />
    </div>
  )
}

function PlanTab({ plan }: { plan: Plan }) {
  const store = useGym()
  const autoWeek = currentWeek(plan)
  const [week, setWeek] = useState(autoWeek)
  const [selected, setSelected] = useState(todayIndex())
  const [logging, setLogging] = useState<number | null>(null)
  const ctx = { level: plan.profile.level, limitations: plan.profile.limitations, age: plan.profile.age }

  const totals = useMemo(() => {
    let mins = 0, cardio = 0, sessions = 0, sets = 0
    for (const raw of plan.days) {
      const d = applyWeek(raw, week)
      mins += dayMinutes(d)
      cardio += d.cardio.reduce((s, c) => s + cardioProtocol(c, ctx, week).minutes, 0)
      if (d.kind === 'workout' || d.kind === 'cardio') sessions++
      sets += d.exercises.reduce((s, pe) => s + pe.sets, 0)
    }
    return { mins, cardio, sessions, sets }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, week])

  const w = WEEKS[week - 1]

  return (
    <div className="stack">
      <div className="card card-pad stack" style={{ gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="badge">{LEVEL_LABEL[plan.profile.level]}</span>
              <span className="badge">{GOAL_LABEL[plan.profile.goal]}</span>
              <span className="badge">{plan.profile.sessionMinutes}′ / προπόνηση</span>
            </div>
            <div className="h2">{SPLIT_NAME(plan.profile.days.length, plan.profile.level, plan.profile.goal, plan.profile.split)}</div>
          </div>
          <div className="row tnum small muted" style={{ gap: 16 }}>
            <span><b style={{ color: 'var(--ink)', fontSize: '1.1rem' }}>{totals.sessions}</b> προπονήσεις</span>
            <span><b style={{ color: 'var(--ink)', fontSize: '1.1rem' }}>{totals.sets}</b> σετ</span>
            <span><b style={{ color: 'var(--ink)', fontSize: '1.1rem' }}>{totals.cardio}′</b> καρδιο</span>
            <span><b style={{ color: 'var(--ink)', fontSize: '1.1rem' }}>{Math.round(totals.mins / 6) / 10}</b> ώρες</span>
          </div>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="segmented" role="group" aria-label="Εβδομάδα κύκλου">
            {WEEKS.map((x) => (
              <button key={x.n} aria-pressed={week === x.n} onClick={() => setWeek(x.n)}>
                Εβδ. {x.n} · {x.label}{x.n === autoWeek ? ' •' : ''}
              </button>
            ))}
          </div>
          <div className="small muted">{w.hint}</div>
        </div>
      </div>

      <WeekView plan={plan} week={week} selected={selected} onSelect={setSelected} logs={store.logs} />
      <DayDetail plan={plan} weekday={selected} week={week} onStart={() => setLogging(selected)} />

      {logging != null && (
        <SessionLogger
          profile={plan.profile}
          day={applyWeek(plan.days[logging], week)}
          weekday={logging}
          week={week}
          onClose={() => setLogging(null)}
        />
      )}
    </div>
  )
}
