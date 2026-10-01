import { useMemo, useState } from 'react'
import { ColumnChart, Legend } from '../../../ui/charts'
import { ConfirmDialog, EmptyState, StatTile } from '../../../ui/components'
import { Icon } from '../../../ui/Icon'
import { formatDate } from '../../../core/format'
import { EXERCISE_BY_ID } from '../data/exercises'
import { cardioMinutesOf, e1rmHistory, formatKg, personalRecords, volumeOf, weekStreak, weeklyBuckets } from '../lib/stats'
import { useGym } from '../store'
import { CARDIO_LABEL } from '../types'

const FEEL = ['', 'Πολύ εύκολη', 'Εύκολη', 'Κανονική', 'Δύσκολη', 'Εξαντλητική']

export function History() {
  const store = useGym()
  const [confirm, setConfirm] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const target = store.plan?.profile.days.length ?? 3

  const buckets = useMemo(() => weeklyBuckets(store.logs, 10), [store.logs])
  const prs = useMemo(() => personalRecords(store.logs).slice(0, 8), [store.logs])
  const streak = useMemo(() => weekStreak(store.logs, target), [store.logs, target])
  const thisWeek = buckets[buckets.length - 1]
  const last4 = buckets.slice(-4)
  const avgCardio = Math.round(last4.reduce((s, b) => s + b.cardio, 0) / 4)

  if (store.logs.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon="calendar"
          title="Καμία καταγεγραμμένη προπόνηση ακόμη"
          hint="Άνοιξε μια μέρα από το πρόγραμμα και πάτα «Ξεκίνα». Εκεί γράφεις κιλά και επαναλήψεις, και εδώ βλέπεις την πρόοδό σου."
        />
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatTile label="Αυτή την εβδομάδα" value={`${thisWeek.sessions} / ${target}`} accent="var(--series-1)" trend={buckets.map((b) => b.sessions)} />
        <StatTile label="Σερί εβδομάδων" value={`${streak}`} accent="var(--series-3)" />
        <StatTile label="Καρδιο / εβδομάδα" value={`${avgCardio}′`} accent="var(--series-2)" trend={buckets.map((b) => b.cardio)} />
        <StatTile label="Σύνολο προπονήσεων" value={`${store.logs.length}`} accent="var(--series-4)" />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <div className="h2">Προπονήσεις ανά εβδομάδα</div>
            <div className="small dim">Τελευταίες 10 εβδομάδες · στόχος {target} την εβδομάδα</div>
          </div>
        </div>
        <div className="card-pad stack" style={{ gap: 10 }}>
          <Legend series={[{ id: 's', label: 'Προπονήσεις', color: 'var(--series-1)' }]} />
          <ColumnChart
            data={buckets.map((b) => ({ key: b.key, label: b.label, values: { s: b.sessions } }))}
            series={[{ id: 's', label: 'Προπονήσεις', color: 'var(--series-1)' }]}
            valueFormat={(n) => (Number.isInteger(n) ? String(n) : '')}
            height={150}
          />
        </div>
      </div>

      {prs.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div className="grow">
              <div className="h2">Καλύτερες επιδόσεις</div>
              <div className="small dim">Εκτίμηση μέγιστης μίας επανάληψης (1RM) από τα καλύτερα σετ σου.</div>
            </div>
          </div>
          <div className="scroll-x">
            <table className="table">
              <thead>
                <tr><th>Άσκηση</th><th className="num">Σετ</th><th className="num">~1RM</th><th className="num">Ημ/νία</th></tr>
              </thead>
              <tbody>
                {prs.map((pr) => {
                  const hist = e1rmHistory(store.logs, pr.exerciseId)
                  const delta = hist.length > 1 ? hist[hist.length - 1] - hist[0] : 0
                  return (
                    <tr key={pr.exerciseId}>
                      <td>{EXERCISE_BY_ID.get(pr.exerciseId)?.name ?? pr.exerciseId}</td>
                      <td className="num">{formatKg(pr.kg)} kg × {pr.reps}</td>
                      <td className="num">
                        <b>{formatKg(Math.round(pr.e1rm))} kg</b>
                        {delta > 0 && <span className="small" style={{ color: 'var(--good-text)' }}> ▲{formatKg(Math.round(delta))}</span>}
                      </td>
                      <td className="num dim">{formatDate(pr.date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-head"><div className="grow"><div className="h2">Ημερολόγιο</div></div></div>
        {store.logs.map((l, i) => {
          const vol = volumeOf(l)
          const cardio = cardioMinutesOf(l)
          const isOpen = open === l.id
          return (
            <div key={l.id} style={{ borderTop: i ? '1px solid var(--line)' : 0 }}>
              <button className="lib-row" onClick={() => setOpen(isOpen ? null : l.id)} aria-expanded={isOpen}>
                <span className="lib-ico"><Icon name="check" size={16} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>{l.title}</span>
                  <span className="small dim" style={{ display: 'block' }}>
                    {formatDate(l.date)} · εβδ. {l.week}
                    {l.durationMin ? ` · ${l.durationMin}′` : ''}
                    {vol > 0 ? ` · ${formatKg(Math.round(vol))} kg όγκος` : ''}
                    {cardio > 0 ? ` · ${cardio}′ καρδιο` : ''}
                  </span>
                </span>
                {l.feel && <span className="badge hide-sm">{FEEL[l.feel]}</span>}
                <Icon name={isOpen ? 'up' : 'down'} size={16} className="dim" />
              </button>
              {isOpen && (
                <div className="lib-more">
                  {l.entries.map((e) => (
                    <div key={e.exerciseId} className="small">
                      <b>{EXERCISE_BY_ID.get(e.exerciseId)?.name}</b>{' '}
                      <span className="muted tnum">
                        {e.sets.map((s) => (s.kg ? `${formatKg(s.kg)}×${s.reps}` : `${s.reps}`)).join(' · ')}
                      </span>
                    </div>
                  ))}
                  {l.cardio.map((c, j) => (
                    <div key={j} className="small">
                      <b>{CARDIO_LABEL[c.machine]}</b> <span className="muted">{c.minutes}′{c.km ? ` · ${formatKg(c.km)} km` : ''}</span>
                    </div>
                  ))}
                  {l.notes && <div className="small muted">«{l.notes}»</div>}
                  <button className="btn btn-sm btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(l.id)}>
                    <Icon name="trash" size={14} /> Διαγραφή
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {confirm && (
        <ConfirmDialog
          title="Διαγραφή προπόνησης"
          message="Η καταγραφή θα διαγραφεί οριστικά."
          onCancel={() => setConfirm(null)}
          onConfirm={() => { void store.deleteLog(confirm); setConfirm(null); setOpen(null) }}
        />
      )}
    </div>
  )
}
