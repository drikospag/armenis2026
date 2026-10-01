import { useMemo, useState } from 'react'
import { Modal } from '../../../ui/components'
import { EXERCISES, EXERCISE_BY_ID } from '../data/exercises'
import { EQUIPMENT_BY_ID } from '../data/equipment'
import { alternatives, isAllowed } from '../lib/generator'
import { useGym } from '../store'
import type { Exercise, Muscle, Profile } from '../types'
import { LEVEL_LABEL, MUSCLE_LABEL } from '../types'
import { EquipmentArt } from './EquipmentArt'

/**
 * Επιλογή άσκησης. Με `replacing` δείχνει πρώτα τις εναλλακτικές για το ίδιο
 * πρότυπο κίνησης· χωρίς αυτό, όλη τη βιβλιοθήκη με φίλτρο μυός.
 */
export function ExercisePicker({ profile, replacing, onPick, onClose }: {
  profile: Profile
  replacing?: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<Muscle | ''>('')
  const cur = replacing ? EXERCISE_BY_ID.get(replacing) : undefined

  const list = useMemo(() => {
    const base = replacing ? alternatives(replacing, profile) : EXERCISES.filter((e) => isAllowed(e, profile))
    const needle = q.trim().toLowerCase()
    return base.filter(
      (e) =>
        (!muscle || e.primary === muscle) &&
        (!needle || e.name.toLowerCase().includes(needle) || e.en.toLowerCase().includes(needle)),
    )
  }, [replacing, profile, q, muscle])

  return (
    <Modal
      title={cur ? `Αντικατάσταση: ${cur.name}` : 'Προσθήκη άσκησης'}
      subtitle={cur ? 'Ίδια κίνηση ή ίδιος μυς, με τον εξοπλισμό που έχεις.' : 'Μόνο ασκήσεις που ταιριάζουν στο επίπεδο και στον εξοπλισμό σου.'}
      onClose={onClose}
      width={620}
    >
      <div className="stack" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
          <input className="input" placeholder="Αναζήτηση…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" style={{ maxWidth: 190 }} value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle | '')}>
            <option value="">Όλοι οι μύες</option>
            {(Object.keys(MUSCLE_LABEL) as Muscle[]).map((m) => <option key={m} value={m}>{MUSCLE_LABEL[m]}</option>)}
          </select>
        </div>
        {list.length === 0 && <div className="small dim">Καμία άσκηση δεν ταιριάζει.</div>}
        <div className="stack" style={{ gap: 6 }}>
          {list.map((e) => (
            <ExerciseRow key={e.id} ex={e} highlight={!!cur && e.pattern === cur.pattern} onClick={() => onPick(e.id)} />
          ))}
        </div>
      </div>
    </Modal>
  )
}

function ExerciseRow({ ex, onClick, highlight }: { ex: Exercise; onClick: () => void; highlight: boolean }) {
  const { photos } = useGym()
  const main = ex.eq[0]?.split('|')[0]
  const eq = ex.eq.map((g) => g.split('|').map((id) => EQUIPMENT_BY_ID.get(id)?.name ?? id).join(' ή ')).join(' + ')
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--r)', width: '100%',
        border: `1px solid ${highlight ? 'var(--accent)' : 'var(--line)'}`, background: 'var(--surface)',
      }}
    >
      <span className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
        {main ? <EquipmentArt id={main} photo={photos[main]} size="sm" label={EQUIPMENT_BY_ID.get(main)?.name ?? ''} /> : <span className="eq-art eq-art-sm" />}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
            <b>{ex.name}</b>
            <span className="small dim">{ex.en}</span>
          </span>
          <span className="small muted" style={{ display: 'block' }}>
            {MUSCLE_LABEL[ex.primary]}
            {ex.secondary?.length ? ` + ${ex.secondary.map((m) => MUSCLE_LABEL[m]).join(', ')}` : ''}
            {' · '}{eq || 'Βάρος σώματος'}
            {ex.level !== 'beginner' && ` · από ${LEVEL_LABEL[ex.level]}`}
          </span>
        </span>
      </span>
    </button>
  )
}
