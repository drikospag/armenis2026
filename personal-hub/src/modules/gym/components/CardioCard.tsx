import { Icon } from '../../../ui/Icon'
import { cardioProtocol, formatDuration } from '../lib/cardio'
import type { CardioCtx } from '../lib/cardio'
import type { CardioBlock } from '../types'

/** Ένα πρωτόκολλο καρδιο (διάδρομος, ποδήλατο…) ως λίστα τμημάτων με ρυθμίσεις. */
export function CardioCard({ block, ctx, week, compact = false }: {
  block: CardioBlock
  ctx: CardioCtx
  week: number
  compact?: boolean
}) {
  const p = cardioProtocol(block, ctx, week)
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8, justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 8, fontWeight: 600 }}>
          <Icon name={block.machine === 'treadmill' ? 'run' : 'heart'} size={16} className="dim" />
          {p.title}
        </span>
        <span className="badge tnum">{p.minutes}′</span>
      </div>
      <div className="stack" style={{ gap: 0, border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        {p.segments.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2px 12px',
              padding: '9px 12px', borderTop: i ? '1px solid var(--line)' : 0,
              background: s.repeat ? 'var(--accent-wash)' : 'transparent',
            }}
          >
            <span style={{ fontWeight: 560 }}>
              {s.repeat ? `${s.repeat} γύροι × ` : ''}{s.label}
            </span>
            <span className="tnum" style={{ fontWeight: 600 }}>
              {formatDuration(s.sec)}{s.rest ? ` + ${formatDuration(s.rest.sec)}` : ''}
            </span>
            <span className="small muted" style={{ gridColumn: '1 / -1' }}>
              {s.setting}
              {s.rest && <> → ανάκαμψη: {s.rest.setting}</>}
            </span>
            {!compact && <span className="small dim" style={{ gridColumn: '1 / -1' }}>Ένταση: {s.intensity}</span>}
          </div>
        ))}
      </div>
      {p.note && !compact && <div className="small dim">{p.note}</div>}
    </div>
  )
}
