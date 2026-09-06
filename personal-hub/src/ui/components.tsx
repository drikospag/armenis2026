import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { Sparkline } from './charts'

const deltaPct = new Intl.NumberFormat('el-GR', { style: 'percent', maximumFractionDigits: 1 })

/* ── Modal ───────────────────────────────────────────────────────────── */

export function Modal({
  title, subtitle, onClose, children, footer, width,
}: {
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.querySelector<HTMLElement>('input,select,textarea,button')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" ref={box} role="dialog" aria-modal="true" style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        <div className="modal-head">
          <div className="grow">
            <div className="h2">{title}</div>
            {subtitle && <div className="small dim">{subtitle}</div>}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Κλείσιμο">
            <Icon name="close" size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ── Confirm ─────────────────────────────────────────────────────────── */

export function ConfirmDialog({
  title, message, confirmLabel = 'Διαγραφή', danger = true, onCancel, onConfirm,
}: {
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={440}
      footer={
        <>
          <button className="btn" onClick={onCancel}>Άκυρο</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <div className="muted">{message}</div>
    </Modal>
  )
}

/* ── Κενή κατάσταση ──────────────────────────────────────────────────── */

export function EmptyState({ icon = 'list', title, hint, action }: {
  icon?: string; title: string; hint?: ReactNode; action?: ReactNode
}) {
  return (
    <div className="empty">
      <Icon name={icon} size={40} className="empty-ico" strokeWidth={1.4} />
      <div className="h2">{title}</div>
      {hint && <div className="small muted" style={{ maxWidth: 420 }}>{hint}</div>}
      {action}
    </div>
  )
}

/* ── Stat tile ───────────────────────────────────────────────────────── */

export function StatTile({
  label, value, delta, deltaLabel, upIsGood = false, trend, trendColor, accent,
}: {
  label: string
  value: string
  delta?: number | null
  deltaLabel?: string
  upIsGood?: boolean
  trend?: number[]
  trendColor?: string
  accent?: string
}) {
  const hasDelta = delta != null && isFinite(delta)
  const good = hasDelta ? (delta! >= 0 ? upIsGood : !upIsGood) : false
  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        {accent && <i className="dot" style={{ background: accent }} />}
        <span className="small muted" style={{ fontWeight: 550 }}>{label}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 640, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</span>
        {trend && trend.length > 1 && <Sparkline values={trend} color={trendColor ?? accent ?? 'var(--accent)'} />}
      </div>
      {hasDelta && (
        <div className="small row" style={{ gap: 5 }}>
          <span style={{ color: good ? 'var(--good-text)' : 'var(--critical)', fontWeight: 600 }}>
            {delta! >= 0 ? '▲' : '▼'} {deltaPct.format(Math.abs(delta!))}
          </span>
          {deltaLabel && <span className="dim">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}

/* ── Switch ──────────────────────────────────────────────────────────── */

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="row" style={{ gap: 10 }} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className="switch" aria-checked={checked} role="switch" />
      <span className="small" style={{ fontWeight: 500 }}>{label}</span>
    </button>
  )
}
