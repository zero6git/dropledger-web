'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { KpiCard, Panel, Badge, ProfitCell, Table, Td, Topbar, Loading, ErrorMsg, statusColor } from '@/components/ui'

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalGSTHST: number
  netProfit: number
  lossOrders: number
  avgMarginPct: string
  period: { from: string; to: string }
}

interface Order {
  id: string
  amazon_order_id: string
  product_title: string
  selling_price: number
  profit: number
  status: string
}

export default function DashboardPage() {
  const { getToken } = useAuth()
  const [kpis, setKpis] = useState<DashboardData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const [dash, ord] = await Promise.all([
          api.get('/api/v1/dashboard', token),
          api.get('/api/v1/orders?limit=5', token),
        ])
        setKpis(dash)
        setOrders(ord.orders ?? [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  return (
    <>
      <Topbar title="Dashboard" />
      <div style={{ padding: 28, flex: 1 }}>
        {loading && <Loading />}
        {error && <ErrorMsg msg={error} />}
        {kpis && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
              <KpiCard label="Net Profit (MTD)" value={`$${kpis.netProfit.toLocaleString()}`} sub="After fees, costs, GST" color="green" />
              <KpiCard label="Total Revenue"    value={`$${kpis.totalRevenue.toLocaleString()}`} sub="Gross Amazon sales" color="blue" />
              <KpiCard label="GST/HST Paid"     value={`$${kpis.totalGSTHST.toLocaleString()}`} sub="Input tax credits" color="gold" />
              <KpiCard label="Loss Orders"      value={kpis.lossOrders} sub="Requires review" color="red" />
              <KpiCard label="Total Orders"     value={kpis.totalOrders} sub="This month" color="purple" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Panel title="Avg Margin">
                <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 48, fontWeight: 800, color: 'var(--accent)' }}>
                    {kpis.avgMarginPct}%
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                    {kpis.period.from} → {kpis.period.to}
                  </div>
                </div>
              </Panel>

              <Panel title="Profit Summary">
                <div style={{ padding: '0 20px 16px' }}>
                  {[
                    { label: 'Gross Revenue',  value: `$${kpis.totalRevenue.toFixed(2)}`,  color: 'var(--accent2)' },
                    { label: 'GST/HST Paid',   value: `−$${kpis.totalGSTHST.toFixed(2)}`, color: 'var(--warn)' },
                    { label: 'Net Profit',      value: `$${kpis.netProfit.toFixed(2)}`,    color: 'var(--accent)' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(31,37,53,0.6)', fontSize: 13 }}>
                      <span style={{ color: 'var(--muted2)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: row.color, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="Recent Orders" action="View all →">
              <Table headers={['Order ID', 'Product', 'Revenue', 'Profit', 'Status']}>
                {orders.map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }}>
                    <Td mono>{o.amazon_order_id}</Td>
                    <Td>{o.product_title ?? '—'}</Td>
                    <Td mono>${(o.selling_price ?? 0).toFixed(2)}</Td>
                    <Td><ProfitCell value={o.profit} /></Td>
                    <Td><Badge label={o.status} color={statusColor(o.status)} /></Td>
                  </tr>
                ))}
              </Table>
            </Panel>
          </>
        )}
      </div>
    </>
  )
}
