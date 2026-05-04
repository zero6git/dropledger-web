'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'

const nav = [
  { section: 'Operations' },
  { href: '/dashboard',  icon: '⬡', label: 'Dashboard' },
  { href: '/orders',     icon: '📦', label: 'Orders' },
  { href: '/purchases',  icon: '🛒', label: 'Purchases' },
  { href: '/shipments',  icon: '🚚', label: 'Shipments' },
  { section: 'Finance' },
  { href: '/reports/profit',    icon: '💰', label: 'Profit Calc' },
  { href: '/reports/tax',       icon: '📊', label: 'Reports / Tax' },
  { section: 'Account' },
  { href: '/billing',    icon: '💳', label: 'Plans / Billing' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const plan =(user?.publicMetadata?.subscription_tier as string) ?? 'starter'

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: 'var(--accent)' }}>
          DropLedger
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          Amazon ERP Platform
        </div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {nav.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 8px 6px' }}>
                {item.section}
              </div>
            )
          }
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 8, fontSize: 13.5, fontWeight: active ? 500 : 400, marginBottom: 2,
              color: active ? 'var(--accent)' : 'var(--muted2)',
              background: active ? 'rgba(0,229,160,0.07)' : 'transparent',
              border: active ? '1px solid rgba(0,229,160,0.15)' : '1px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserButton appearance={{
            elements: { avatarBox: { width: 30, height: 30 } }
          }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: 1, textTransform: 'uppercase' }}>
              {plan} Plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
