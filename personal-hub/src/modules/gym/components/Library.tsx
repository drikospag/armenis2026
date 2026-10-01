import { useMemo, useState } from 'react'
import { Icon } from '../../../ui/Icon'
import { EQUIPMENT, EQUIPMENT_CAT_LABEL } from '../data/equipment'
import { EXERCISES } from '../data/exercises'
import { isAllowed } from '../lib/generator'
import type { Equipment, EquipmentCat, Muscle, Profile } from '../types'
import { CARDIO_LABEL, JOINT_LABEL, LEVEL_LABEL, MUSCLE_LABEL } from '../types'

/** Κατάλογος μηχανημάτων: τι κάνει το καθένα και ποιες ασκήσεις γίνονται εκεί. */
export function Library({ profile }: { profile: Profile | null }) {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<Muscle | ''>('')
  const [open, setOpen] = useState<string | null>(null)

  const byEquipment = useMemo(() => {
    const map = new Map<string, typeof EXERCISES>()
    for (const ex of EXERCISES) {
      const ids = ex.eq.length ? ex.eq.flatMap((g) => g.split('|')) : ['__bw']
      for (const id of ids) map.set(id, [...(map.get(id) ?? []), ex])
    }
    return map
  }, [])

  const needle = q.trim().toLowerCase()
  const matches = (e: Equipment) => {
    const exs = byEquipment.get(e.id) ?? []
    if (muscle && e.cat !== 'cardio' && !exs.some((x) => x.primary === muscle)) return false
    if (muscle && e.cat === 'cardio') return false
    if (!needle) return true
    return e.name.toLowerCase().includes(needle) || exs.some((x) => x.name.toLowerCase().includes(needle) || x.en.toLowerCase().includes(needle))
  }

  const order: EquipmentCat[] = ['cardio', 'machine', 'cable', 'free']
  const bodyweight = (byEquipment.get('__bw') ?? []).filter((x) => (!muscle || x.primary === muscle) && (!needle || x.name.toLowerCase().includes(needle)))

  return (
    <div className="stack">
      <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
        <input className="input" placeholder="Αναζήτηση μηχανήματος ή άσκησης…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" style={{ maxWidth: 200 }} value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle | '')}>
          <option value="">Όλοι οι μύες</option>
          {(Object.keys(MUSCLE_LABEL) as Muscle[]).map((m) => <option key={m} value={m}>{MUSCLE_LABEL[m]}</option>)}
        </select>
      </div>
      <div className="small dim">
        {EQUIPMENT.length} μηχανήματα & όργανα · {EXERCISES.length} ασκήσεις.
        {profile && ' Με γκρι όσα δεν έχεις δηλώσει ή δεν ταιριάζουν στο επίπεδό σου.'}
      </div>

      {order.map((cat) => {
        const items = EQUIPMENT.filter((e) => e.cat === cat && matches(e))
        if (items.length === 0) return null
        return (
          <div key={cat} className="stack" style={{ gap: 8 }}>
            <div className="h3">{EQUIPMENT_CAT_LABEL[cat]}</div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {items.map((e, i) => {
                const owned = !profile || profile.equipment.includes(e.id)
                const exs = (byEquipment.get(e.id) ?? []).filter((x) => !muscle || x.primary === muscle)
                const isOpen = open === e.id
                return (
                  <div key={e.id} style={{ borderTop: i ? '1px solid var(--line)' : 0, opacity: owned ? 1 : 0.55 }}>
                    <button className="lib-row" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen}>
                      <span className="lib-ico"><Icon name={cat === 'cardio' ? 'run' : 'dumbbell'} size={17} /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 600 }}>{e.name}</span>
                        <span className="small dim" style={{ display: 'block' }}>{e.desc}</span>
                      </span>
                      {cat !== 'cardio' && <span className="badge tnum">{exs.length}</span>}
                      <Icon name={isOpen ? 'up' : 'down'} size={16} className="dim" />
                    </button>
                    {isOpen && (
                      <div className="lib-more">
                        {cat === 'cardio' ? <CardioHelp id={e.id as keyof typeof CARDIO_LABEL} /> : exs.map((x) => (
                          <ExerciseInfo key={x.id} ex={x} profile={profile} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {bodyweight.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="h3">Χωρίς εξοπλισμό</div>
          <div className="card card-pad stack" style={{ gap: 12 }}>
            {bodyweight.map((x) => <ExerciseInfo key={x.id} ex={x} profile={profile} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseInfo({ ex, profile }: { ex: (typeof EXERCISES)[number]; profile: Profile | null }) {
  const ok = !profile || isAllowed(ex, profile)
  return (
    <div className="stack" style={{ gap: 4, opacity: ok ? 1 : 0.6 }}>
      <div className="row" style={{ gap: 8 }}>
        <b>{ex.name}</b>
        <span className="small dim">{ex.en}</span>
        <span className="badge">{LEVEL_LABEL[ex.level]}</span>
        {ex.stress?.map((j) => <span key={j} className="badge" title="Φορτίζει αυτή την άρθρωση">{JOINT_LABEL[j]}</span>)}
      </div>
      <div className="small muted">
        {MUSCLE_LABEL[ex.primary]}{ex.secondary?.length ? ` + ${ex.secondary.map((m) => MUSCLE_LABEL[m]).join(', ')}` : ''}
      </div>
      <ul className="list small">{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul>
    </div>
  )
}

const CARDIO_TIPS: Record<string, string[]> = {
  treadmill: [
    'Περπάτημα σε κλίση (5–12%) στα 5–6 km/h: καίει πολλές θερμίδες με ελάχιστη καταπόνηση.',
    'Διαλειμματικό: εναλλαγή γρήγορου τρεξίματος και περπατήματος — π.χ. 1′ στα 10 km/h / 1′ στα 5,5 km/h.',
    'Μην κρατιέσαι από τις χειρολαβές: μειώνει την ένταση και χαλάει τη στάση.',
    'Με πρόβλημα στα γόνατα, προτίμησε κλίση αντί για ταχύτητα.',
  ],
  bike: ['Ρύθμισε τη σέλα στο ύψος του γοφού — γόνατο ελαφρώς λυγισμένο κάτω.', 'Ιδανικό για διαλειμματικά χωρίς κρούση.', '80–90 στροφές/λεπτό για σταθερό καρδιο.'],
  elliptical: ['Κράτα τις κινητές λαβές για να δουλέψουν και τα χέρια.', 'Μην πατάς μόνο στις μύτες.', 'Καλή εναλλακτική του διαδρόμου για βαριά άτομα ή ενοχλήσεις.'],
  rower: ['Σειρά: πόδια → κορμός → χέρια, και ανάποδα στην επιστροφή.', '60% της δύναμης από τα πόδια.', 'Αντίσταση (damper) 4–6, όχι στο τέρμα.'],
  stairs: ['Όρθιος κορμός, χωρίς να ακουμπάς βάρος στις χειρολαβές.', 'Πάτα με όλο το πέλμα.', 'Πολύ αποδοτικό για γλουτούς — ξεκίνα με 10′.'],
}

function CardioHelp({ id }: { id: string }) {
  return <ul className="list small">{(CARDIO_TIPS[id] ?? []).map((t) => <li key={t}>{t}</li>)}</ul>
}
