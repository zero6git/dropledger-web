'use client'

import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Topbar, Btn } from '@/components/ui'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: '',
    color: 'var(--muted2)',
    features: ['Up to 50 orders/month', 'Profit tracking', 'GST/HST reports', 'Manual order entry'],
  },
  {
    name: 'Growth',
    price: '$29',
    priceNote: '/mo CAD',
    color: 'var(--accent)',
    featured: true,
    features: ['Unlimited orders', 'Email automation (n8n)', 'Supplier receipt OCR queue', 'All Starter features'],
  },
  {
    name: 'Pro',
    price: 'Custom',
    priceNote: '',
    color: '#b97cff',
    features: ['Everything in Growth', 'AI-powered insights', 'Multi-user access', 'Priority support'],
  },
]

export default function BillingPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const currentTier = (user?.publicMetadata?.subscription_tier as string) ?? 'starter'

  async function openPortal() {
    setLoading(true)
    try {
      const token = await getToken()
      const { url } = await api.post('/api/v1/billing/portal', token!, {})
      window.location.href = url
    } catch {
      alert('Could not open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Plans / Billing">
        <Btn variant="ghost" onClick={openPortal} disabled={loading}>
          {loading ? 'Loading…' : 'Manage Billing'}
        </Btn>
      </Topbar>
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Choose your plan</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Current plan: <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>{currentTier}</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: 'var(--surface)', border: `1px solid ${plan.featured ? plan.color : 'var(--border)'}`,
              borderRadius: 12, padding: 24, position: 'relative',
              boxShadow: plan.featured ? `0 0 24px rgba(0,229,160,0.08)` : 'none',
            }}>
              {plan.featured && (
                <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 1.5, background: 'var(--accent)', color: '#000', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                  POPULAR
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, margin: '10px 0', color: plan.color }}>
                {plan.price}
                {plan.priceNote && <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>{plan.priceNote}</span>}
              </div>
              <div style={{ marginBottom: 20 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: 12, color: 'var(--muted2)', padding: '5px 0', borderBottom: '1px solid rgba(31,37,53,0.5)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 11 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              {currentTier === plan.name.toLowerCase() ? (
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', padding: '8px 0' }}>Current Plan</div>
              ) : (
                <Btn variant={plan.featured ? 'primary' : 'ghost'} onClick={openPortal}>
                  {plan.name === 'Starter' ? 'Downgrade' : 'Upgrade'}
                </Btn>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
