'use client'

import { CSSProperties, ReactNode } from 'react'

// ── KPI Card ──────────────────────────────────────────────────
type KpiColor = 'green' | 'blue' | 'gold' | 'red' | 'purple'
const kpiColors: Record<KpiColor, { bar: string; value: string }> = {
  green:  { bar: 'var(--accent)',  value: 'var(--accent)' },
  blue:   { bar: 'var(--accent2)', value: 'var(--accent2)' },
  gold:   { bar: 'var(--gold)',    value: 'var(--gold)' },
  red:    { bar: 'var(--warn)',    value: 'var(--warn)' },
  purple: { bar: '#b97cff',        value: '#b97cff' },
}

export function KpiCard({ label, value, sub, delta, deltaUp, color }: {
  label: string; value: string | number; sub?: string
  delta?: string; deltaUp?: boolean; color: KpiColor
}) {
  const c = kpiColors[color]
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.bar }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, lineHeight: 1, color: c.value }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{sub}</div>}
      {delta && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 6, display: 'inline-block',
          padding: '2px 6px', borderRadius: 4,
          background: deltaUp ? 'rgba(0,229,160,0.1)' : 'rgba(255,107,74,0.1)',
          color: deltaUp ? 'var(--accent)' : 'var(--warn)',
        }}>
          {delta}
        </span>
      )}
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────
export function Panel({ title, action, onAction, children, style }: {
  title: string; action?: string; onAction?: () => void
  children: ReactNode; style?: CSSProperties
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', ...style }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700 }}>{title}</div>
        {action && (
          <button onClick={onAction} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', letterSpacing: 0.5 }}>
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────
type BadgeColor = 'green' | 'blue' | 'red' | 'gold' | 'muted' | 'purple'
const badgeStyles: Record<BadgeColor, CSSProperties> = {
  green:  { background: 'rgba(0,229,160,0.1)',   color: 'var(--accent)' },
  blue:   { background: 'rgba(79,127,255,0.12)',  color: 'var(--accent2)' },
  red:    { background: 'rgba(255,107,74,0.1)',   color: 'var(--warn)' },
  gold:   { background: 'rgba(245,200,66,0.1)',   color: 'var(--gold)' },
  muted:  { background: 'rgba(92,100,128,0.15)',  color: 'var(--muted2)' },
  purple: { background: 'rgba(185,124,255,0.1)',  color: '#b97cff' },
}

export function Badge({ label, color }: { label: string; color: BadgeColor }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 5, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
      ...badgeStyles[color],
    }}>
      <span style={{ fontSize: 7 }}>●</span>{label}
    </span>
  )
}

// ── Status → Badge color map ──────────────────────────────────
export function statusColor(status: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    delivered: 'green', shipped: 'blue', purchased: 'blue',
    pending: 'gold', refunded: 'purple', loss: 'red',
    label_created: 'muted', in_transit: 'blue', out_for_delivery: 'blue',
    delayed: 'gold', exception: 'red',
  }
  return map[status] ?? 'muted'
}

// ── Profit value ──────────────────────────────────────────────
export function ProfitCell({ value }: { value: number | null }) {
  const v = value ?? 0
  const color = v > 0 ? 'var(--accent)' : v < 0 ? 'var(--warn)' : 'var(--gold)'
  const prefix = v > 0 ? '+' : ''
  return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color }}>{prefix}${v.toFixed(2)}</span>
}

// ── Btn ───────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', type = 'button', disabled }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'warn'
  type?: 'button' | 'submit'; disabled?: boolean
}) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#000', fontWeight: 600 },
    ghost:   { background: 'transparent', color: 'var(--muted2)', border: '1px solid var(--border)' },
    warn:    { background: 'rgba(255,107,74,0.12)', color: 'var(--warn)', border: '1px solid rgba(255,107,74,0.2)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
      fontFamily: 'var(--font-body)', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
      ...styles[variant],
    }}>
      {children}
    </button>
  )
}

// ── Topbar ────────────────────────────────────────────────────
export function Topbar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 28px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{children}</div>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5,
              textTransform: 'uppercase', color: 'var(--muted)', padding: '10px 16px',
              textAlign: 'left', borderBottom: '1px solid var(--border)',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

export function Td({ children, mono, style }: { children: ReactNode; mono?: boolean; style?: CSSProperties }) {
  return (
    <td style={{
      padding: '11px 16px',
      borderBottom: '1px solid rgba(31,37,53,0.5)',
      fontFamily: mono ? 'var(--font-mono)' : undefined,
      fontSize: mono ? 12 : 13,
      ...style,
    }}>
      {children}
    </td>
  )
}

// ── Form helpers ──────────────────────────────────────────────
export function FormInput({ label, name, type = 'text', value, onChange, required, placeholder }: {
  label: string; name: string; type?: string; value: string | number
  onChange: (v: string) => void; required?: boolean; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </label>
      <input
        name={name} type={type} value={value} required={required}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7,
          padding: '9px 12px', color: 'var(--text)', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none',
        }}
      />
    </div>
  )
}

export function FormSelect({ label, name, value, onChange, options }: {
  label: string; name: string; value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>
        {label}
      </label>
      <select
        name={name} value={value} onChange={e => onChange(e.target.value)}
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7,
          padding: '9px 12px', color: 'var(--text)', fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Loading / Error states ────────────────────────────────────
export function Loading() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      Loading...
    </div>
  )
}

export function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ margin: 20, padding: '12px 16px', borderRadius: 9, background: 'rgba(255,107,74,0.08)', border: '1px solid rgba(255,107,74,0.2)', color: 'var(--warn)', fontSize: 13 }}>
      {msg}
    </div>
  )
}
