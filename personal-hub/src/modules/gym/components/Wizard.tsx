import { useMemo, useState } from 'react'
import { Icon } from '../../../ui/Icon'
import { EQUIPMENT, EQUIPMENT_CAT_LABEL, EQUIPMENT_PRESETS } from '../data/equipment'
import { EXERCISES } from '../data/exercises'
import { DEFAULT_DAYS, SPLIT_NAME, isAllowed } from '../lib/generator'
import type { CardioMachine, EquipmentCat, Goal, Joint, Level, Profile } from '../types'
import {
  CARDIO_LABEL, GOAL_HINT, GOAL_LABEL, JOINT_LABEL, LEVEL_HINT, LEVEL_LABEL, WEEKDAYS_SHORT,
} from '../types'

export const DEFAULT_PROFILE: Profile = {
  level: 'beginner',
  goal: 'fitness',
  days: DEFAULT_DAYS[3],
  sessionMinutes: 60,
  equipment: EQUIPMENT.map((e) => e.id),
  cardio: ['treadmill'],
  limitations: [],
}

const CARDIO_MACHINES: CardioMachine[] = ['treadmill', 'bike', 'elliptical', 'rower', 'stairs']

/** Φόρμα προφίλ: από εδώ βγαίνει το πρόγραμμα. Χρησιμοποιείται και για επεξεργασία. */
export function Wizard({
  initial, onSubmit, onCancel, submitLabel = 'Φτιάξε το πρόγραμμα',
}: {
  initial?: Profile
  onSubmit: (p: Profile) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const [p, setP] = useState<Profile>(initial ?? DEFAULT_PROFILE)
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((cur) => ({ ...cur, [k]: v }))
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const available = useMemo(() => EXERCISES.filter((e) => isAllowed(e, p)).length, [p])
  const hasCardio = CARDIO_MACHINES.some((m) => p.equipment.includes(m))
  const daysOk = p.days.length >= 1 && p.days.length <= 6
  const valid = daysOk && available >= 12

  const groups = useMemo(() => {
    const order: EquipmentCat[] = ['cardio', 'machine', 'cable', 'free']
    return order.map((cat) => ({ cat, items: EQUIPMENT.filter((e) => e.cat === cat) }))
  }, [])

  return (
    <div className="stack">
      <Section n={1} title="Επίπεδο">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {(Object.keys(LEVEL_LABEL) as Level[]).map((lv) => (
            <Choice key={lv} active={p.level === lv} onClick={() => set('level', lv)} title={LEVEL_LABEL[lv]} hint={LEVEL_HINT[lv]} />
          ))}
        </div>
      </Section>

      <Section n={2} title="Στόχος">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
            <Choice key={g} active={p.goal === g} onClick={() => set('goal', g)} title={GOAL_LABEL[g]} hint={GOAL_HINT[g]} />
          ))}
        </div>
      </Section>

      <Section n={3} title="Πότε προπονείσαι" hint="Διάλεξε 1–6 μέρες. Οι υπόλοιπες γίνονται ενεργή ανάκαμψη ή ξεκούραση.">
        <div className="row" style={{ gap: 6 }}>
          {WEEKDAYS_SHORT.map((d, i) => (
            <button key={d} className="chip" aria-pressed={p.days.includes(i)} onClick={() => set('days', toggle(p.days, i).sort((a, b) => a - b))}>
              {d}
            </button>
          ))}
        </div>
        <div className="row small" style={{ gap: 6 }}>
          <span className="dim">Γρήγορη επιλογή:</span>
          {[2, 3, 4, 5, 6].map((n) => (
            <button key={n} className="link" onClick={() => set('days', DEFAULT_DAYS[n])}>{n} μέρες</button>
          ))}
        </div>
        {daysOk ? (
          <div className="small muted">
            Διάσπαση: <b style={{ color: 'var(--ink)' }}>{SPLIT_NAME(p.days.length, p.level, p.goal)}</b> · {p.days.length} προπονήσεις την εβδομάδα
          </div>
        ) : (
          <div className="small" style={{ color: 'var(--critical)' }}>Διάλεξε από 1 έως 6 μέρες — μία τουλάχιστον μέρα ξεκούρασης χρειάζεται.</div>
        )}

        <div className="field" style={{ maxWidth: 360 }}>
          <span className="label">Διάρκεια κάθε προπόνησης</span>
          <div className="segmented">
            {[45, 60, 75, 90].map((m) => (
              <button key={m} aria-pressed={p.sessionMinutes === m} onClick={() => set('sessionMinutes', m)}>{m}′</button>
            ))}
          </div>
        </div>
      </Section>

      <Section n={4} title="Μηχανήματα του γυμναστηρίου σου" hint="Ξετσέκαρε ό,τι δεν υπάρχει. Το πρόγραμμα θα χρησιμοποιήσει μόνο τα υπόλοιπα.">
        <div className="row" style={{ gap: 6 }}>
          {EQUIPMENT_PRESETS.map((pr) => (
            <button key={pr.id} className="btn btn-sm" onClick={() => set('equipment', pr.ids)}>{pr.label}</button>
          ))}
        </div>
        {groups.map(({ cat, items }) => (
          <div key={cat} className="stack" style={{ gap: 8 }}>
            <div className="h3">{EQUIPMENT_CAT_LABEL[cat]}</div>
            <div className="row" style={{ gap: 6 }}>
              {items.map((e) => (
                <button
                  key={e.id}
                  className="chip"
                  title={e.desc}
                  aria-pressed={p.equipment.includes(e.id)}
                  onClick={() => set('equipment', toggle(p.equipment, e.id))}
                >
                  {p.equipment.includes(e.id) && <Icon name="check" size={13} />}
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="small" style={{ color: available < 12 ? 'var(--critical)' : 'var(--ink-3)' }}>
          {available} ασκήσεις διαθέσιμες με αυτόν τον εξοπλισμό
          {available < 12 && ' — πολύ λίγες για πλήρες πρόγραμμα. Πρόσθεσε εξοπλισμό.'}
        </div>
      </Section>

      <Section n={5} title="Καρδιο" hint="Ποια μηχανήματα καρδιο προτιμάς; Ο διάδρομος χρησιμοποιείται και για το ζέσταμα όταν υπάρχει.">
        {hasCardio ? (
          <div className="row" style={{ gap: 6 }}>
            {CARDIO_MACHINES.filter((m) => p.equipment.includes(m)).map((m) => (
              <button key={m} className="chip" aria-pressed={p.cardio.includes(m)} onClick={() => set('cardio', toggle(p.cardio, m))}>
                {p.cardio.includes(m) && <Icon name="check" size={13} />}
                {CARDIO_LABEL[m]}
              </button>
            ))}
          </div>
        ) : (
          <div className="small dim">Δεν έχεις επιλέξει μηχάνημα καρδιο — το πρόγραμμα θα έχει μόνο βάρη.</div>
        )}
      </Section>

      <Section n={6} title="Προαιρετικά" hint="Η ηλικία δίνει στόχους σφυγμών στο καρδιο. Οι ενοχλήσεις αποκλείουν ασκήσεις που φορτίζουν την άρθρωση.">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', maxWidth: 420 }}>
          <label className="field">
            <span className="label">Ηλικία</span>
            <input
              className="input" type="number" min={14} max={90} inputMode="numeric" placeholder="π.χ. 35"
              value={p.age ?? ''} onChange={(e) => set('age', e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
          <label className="field">
            <span className="label">Βάρος (kg)</span>
            <input
              className="input" type="number" min={35} max={250} inputMode="decimal" placeholder="π.χ. 78"
              value={p.weightKg ?? ''} onChange={(e) => set('weightKg', e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
        </div>
        <div className="field">
          <span className="label">Ενοχλήσεις / τραυματισμοί</span>
          <div className="row" style={{ gap: 6 }}>
            {(Object.keys(JOINT_LABEL) as Joint[]).map((j) => (
              <button key={j} className="chip" aria-pressed={p.limitations.includes(j)} onClick={() => set('limitations', toggle(p.limitations, j))}>
                {JOINT_LABEL[j]}
              </button>
            ))}
          </div>
          {p.limitations.length > 0 && (
            <span className="small dim">
              Δεν αντικαθιστά γιατρό ή φυσικοθεραπευτή. Σταμάτα κάθε άσκηση που προκαλεί πόνο.
            </span>
          )}
        </div>
      </Section>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        {onCancel && <button className="btn" onClick={onCancel}>Άκυρο</button>}
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit(p)}>
          <Icon name="sparkles" size={16} /> {submitLabel}
        </button>
      </div>
    </div>
  )
}

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card card-pad stack" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <span
          style={{
            width: 26, height: 26, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center',
            background: 'var(--accent-wash)', color: 'var(--accent-ink)', fontWeight: 650, fontSize: 13,
          }}
        >
          {n}
        </span>
        <div>
          <div className="h2">{title}</div>
          {hint && <div className="small dim">{hint}</div>}
        </div>
      </div>
      {children}
    </section>
  )
}

function Choice({ active, onClick, title, hint }: { active: boolean; onClick: () => void; title: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        textAlign: 'left', padding: 14, borderRadius: 'var(--r)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
        background: active ? 'var(--accent-wash)' : 'var(--surface)',
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <b style={{ color: active ? 'var(--accent-ink)' : 'var(--ink)' }}>{title}</b>
        {active && <Icon name="check" size={16} className="dim" />}
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>{hint}</div>
    </button>
  )
}
