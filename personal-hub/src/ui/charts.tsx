import { useMemo, useState } from 'react'
import { useSize } from './useSize'
import { compactEur, money } from '../core/format'

/* ── κοινά ────────────────────────────────────────────────────────────── */

export const SERIES_VARS: string[] = [
  'var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
  'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)',
]

export interface Series { id: string; label: string; color: string }

/** «Ωραία» ανώτατη τιμή άξονα + βήμα, ώστε τα ticks να είναι στρογγυλά. */
function niceScale(max: number, ticks = 4): { max: number; step: number } {
  if (!isFinite(max) || max <= 0) return { max: 100, step: 25 }
  const raw = max / ticks
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  return { max: step * ticks, step }
}

/** Ορθογώνιο με στρογγυλεμένη μόνο την πάνω πλευρά (data-end). */
function topRoundedPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, h, w / 2))
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}
function rightRoundedPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w, h / 2))
  return `M${x},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} L${x},${y + h} Z`
}

export function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null
  return (
    <div className="row" style={{ gap: 14, rowGap: 6 }}>
      {series.map((s) => (
        <span key={s.id} className="row small muted" style={{ gap: 6 }}>
          <i className="dot" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

function Tooltip({ x, y, w, children }: { x: number; y: number; w: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x, 8), Math.max(8, w - 8))
  return (
    <div
      style={{
        position: 'absolute', left, top: y, transform: 'translate(-50%,-100%)',
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
        boxShadow: 'var(--shadow-md)', padding: '8px 10px', pointerEvents: 'none',
        whiteSpace: 'nowrap', zIndex: 5, fontSize: 13,
      }}
    >
      {children}
    </div>
  )
}

/* ── Στήλες (απλές ή στοιβαγμένες) ───────────────────────────────────── */

export interface ColumnPoint { key: string; label: string; values: Record<string, number> }

export function ColumnChart({
  data, series, height = 190, emphasisKey, onSelect, valueFormat = compactEur,
}: {
  data: ColumnPoint[]
  series: Series[]
  height?: number
  emphasisKey?: string
  onSelect?: (key: string) => void
  valueFormat?: (n: number) => string
}) {
  const { ref, width } = useSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const padL = 46, padR = 8, padT = 10, axisH = 24
  const plotW = Math.max(10, width - padL - padR)
  const totals = data.map((d) => series.reduce((s, k) => s + (d.values[k.id] || 0), 0))
  const { max, step } = niceScale(Math.max(0, ...totals))
  const yOf = (v: number) => padT + (1 - v / max) * height
  const band = plotW / Math.max(1, data.length)
  const barW = Math.min(24, Math.max(6, band * 0.6))
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {width > 0 && (
        <svg width={width} height={height + padT + axisH} role="img" aria-label="Στήλες ανά περίοδο">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={yOf(t)} y2={yOf(t)} stroke="var(--grid)" strokeWidth={1} />
              <text x={padL - 8} y={yOf(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {t === 0 ? '0' : valueFormat(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = padL + band * i + band / 2
            const dim = emphasisKey != null && d.key !== emphasisKey
            let acc = 0
            const segs = series
              .map((s) => ({ s, v: d.values[s.id] || 0 }))
              .filter((x) => x.v > 0)
            return (
              <g key={d.key} opacity={dim ? 0.42 : 1}>
                {segs.map(({ s, v }, si) => {
                  const y0 = yOf(acc)
                  acc += v
                  const y1 = yOf(acc)
                  const isTop = si === segs.length - 1
                  const gap = si > 0 ? 2 : 0 // 2px κενό στο χρώμα επιφάνειας ανάμεσα στα τμήματα
                  const h = Math.max(1, y0 - y1 - gap)
                  const y = y1
                  return (
                    <path
                      key={s.id}
                      d={isTop ? topRoundedPath(cx - barW / 2, y, barW, h, 4) : `M${cx - barW / 2},${y}h${barW}v${h}h${-barW}Z`}
                      fill={s.color}
                    />
                  )
                })}
                {segs.length === 0 && (
                  <line x1={cx - barW / 2} x2={cx + barW / 2} y1={yOf(0)} y2={yOf(0)} stroke="var(--axis)" strokeWidth={2} strokeLinecap="round" />
                )}
              </g>
            )
          })}
          <line x1={padL} x2={width - padR} y1={yOf(0)} y2={yOf(0)} stroke="var(--axis)" strokeWidth={1} />
          {data.map((d, i) => (
            <text
              key={d.key}
              x={padL + band * i + band / 2}
              y={height + padT + 16}
              textAnchor="middle"
              fontSize={11}
              fill={emphasisKey === d.key ? 'var(--ink)' : 'var(--ink-3)'}
              fontWeight={emphasisKey === d.key ? 600 : 400}
            >
              {d.label}
            </text>
          ))}
          {data.map((d, i) => (
            <rect
              key={`hit-${d.key}`}
              x={padL + band * i} y={padT} width={band} height={height}
              fill="transparent"
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(d.key)}
            />
          ))}
        </svg>
      )}
      {hover != null && data[hover] && (
        <Tooltip x={padL + band * hover + band / 2} y={padT + 2} w={width}>
          <div style={{ fontWeight: 620, marginBottom: 4 }}>{data[hover].label}</div>
          {series.map((s) => (
            <div key={s.id} className="row" style={{ gap: 6, justifyContent: 'space-between' }}>
              <span className="row" style={{ gap: 6 }}>
                <i className="dot" style={{ background: s.color }} />
                <span className="muted">{s.label}</span>
              </span>
              <span className="tnum" style={{ fontWeight: 560 }}>{money(data[hover].values[s.id] || 0)}</span>
            </div>
          ))}
          {series.length > 1 && (
            <div className="row" style={{ gap: 14, justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--line)' }}>
              <span className="muted">Σύνολο</span>
              <span className="tnum" style={{ fontWeight: 640 }}>{money(totals[hover])}</span>
            </div>
          )}
        </Tooltip>
      )}
    </div>
  )
}

/* ── Κατάταξη (οριζόντιες μπάρες με direct labels) ───────────────────── */

export interface RankedItem { id: string; label: string; value: number; color: string; sub?: string }

export function RankedBars({ items, max: maxIn }: { items: RankedItem[]; max?: number }) {
  const { ref, width } = useSize<HTMLDivElement>()
  const max = maxIn ?? Math.max(1, ...items.map((i) => i.value))
  const rowH = 34, barH = 18
  const labelW = Math.min(180, Math.max(96, Math.round(width * 0.32)))
  const valueW = 92
  const plotW = Math.max(20, width - labelW - valueW - 12)
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {width > 0 && (
        <svg width={width} height={items.length * rowH} role="img" aria-label="Κατάταξη κατηγοριών">
          {items.map((it, i) => {
            const y = i * rowH
            const w = Math.max(2, (it.value / max) * plotW)
            return (
              <g key={it.id} onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}>
                <rect x={0} y={y} width={width} height={rowH} fill={hover === it.id ? 'var(--surface-hover)' : 'transparent'} rx={6} />
                <text x={8} y={y + rowH / 2 + 4} fontSize={13} fill="var(--ink)" >
                  {it.label.length > 22 ? it.label.slice(0, 21) + '…' : it.label}
                </text>
                <path d={rightRoundedPath(labelW, y + (rowH - barH) / 2, w, barH, 4)} fill={it.color} />
                <text
                  x={width - 6} y={y + rowH / 2 + 4} textAnchor="end" fontSize={13}
                  fill="var(--ink)" fontWeight={560} style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {money(it.value)}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

/* ── Split bar (100% stacked, μία γραμμή) ────────────────────────────── */

export function SplitBar({ parts, height = 12 }: { parts: { id: string; label: string; value: number; color: string }[]; height?: number }) {
  const total = parts.reduce((s, p) => s + p.value, 0)
  if (total <= 0) return <div className="progress" style={{ height }} />
  return (
    <div style={{ display: 'flex', gap: 2, height, borderRadius: 999, overflow: 'hidden' }}>
      {parts.filter((p) => p.value > 0).map((p) => (
        <div
          key={p.id}
          title={`${p.label}: ${money(p.value)}`}
          style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
        />
      ))}
    </div>
  )
}

/* ── Sparkline ───────────────────────────────────────────────────────── */

export function Sparkline({ values, color = 'var(--accent)', width = 96, height = 26 }: {
  values: number[]; color?: string; width?: number; height?: number
}) {
  const d = useMemo(() => {
    if (values.length < 2) return ''
    const max = Math.max(...values, 1)
    const stepX = width / (values.length - 1)
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(height - (v / max) * (height - 3) - 1.5).toFixed(1)}`)
      .join(' ')
  }, [values, width, height])
  if (!d) return null
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
