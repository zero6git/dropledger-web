'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { Panel, KpiCard, Table, Td, Topbar, Btn, Loading, ErrorMsg, ProfitCell, Badge, statusColor } from '@/components/ui'

interface ProfitReport {
  period: { month: number; year: number; from: string; to: string }
  totalOrders: number
  totalRevenue: number
  totalAmazonFees: number
  totalCOGS: number
  totalShipping: number
  totalGSTHST: number
  netProfit: number
  lossOrders: number
  orders: Array<{ id: string; amazon_order_id: string; order_date: string; product_title: string; selling_price: number; profit: number; status: string }>
}

export default function ProfitPage() {
  const { getToken } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState<ProfitReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const data = await api.get(`/api/v1/reports/profit?month=${month}&year=${year}`, token!)
      setReport(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month, year])

  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i).toLocaleString('default', { month: 'long' }) }))
  const years = [2024, 2025, 2026].map(y => ({ value: String(y), label: String(y) }))

  return (
    <>
      <Topbar title="Profit Report">
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
        </select>
      </Topbar>
      <div style={{ padding: 28 }}>
        {error && <ErrorMsg msg={error} />}
        {loading && <Loading />}

        {report && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              <KpiCard label="Net Profit"     value={`$${report.netProfit.toFixed(2)}`}      color="green" />
              <KpiCard label="Total Revenue"  value={`$${report.totalRevenue.toFixed(2)}`}    color="blue" />
              <KpiCard label="Amazon Fees"    value={`$${report.totalAmazonFees.toFixed(2)}`} color="red" />
              <KpiCard label="COGS"           value={`$${report.totalCOGS.toFixed(2)}`}       color="gold" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
              <Panel title="P&L Breakdown">
                <div style={{ padding: '0 20px 16px' }}>
                  {[
                    { label: 'Revenue',       value: `+$${report.totalRevenue.toFixed(2)}`,    color: 'var(--accent2)' },
                    { label: 'Amazon Fees',   value: `−$${report.totalAmazonFees.toFixed(2)}`, color: 'var(--warn)' },
                    { label: 'COGS',          value: `−$${report.totalCOGS.toFixed(2)}`,       color: 'var(--warn)' },
                    { label: 'Shipping',      value: `−$${report.totalShipping.toFixed(2)}`,   color: 'var(--warn)' },
                    { label: 'GST/HST',       value: `−$${report.totalGSTHST.toFixed(2)}`,     color: 'var(--warn)' },
                    { label: 'Net Profit',    value: `$${report.netProfit.toFixed(2)}`,         color: 'var(--accent)', total: true },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: row.total ? 'none' : '1px solid rgba(31,37,53,0.6)',
                      borderTop: row.total ? '2px solid var(--border)' : 'none',
                      marginTop: row.total ? 4 : 0, paddingTop: row.total ? 12 : 10,
                      fontSize: row.total ? 15 : 13, fontFamily: row.total ? 'var(--font-head)' : undefined, fontWeight: row.total ? 700 : 400,
                    }}>
                      <span style={{ color: 'var(--muted2)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: row.color, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={`Orders (${report.totalOrders}) — ${report.lossOrders} loss`}>
                <Table headers={['Date', 'Order ID', 'Product', 'Revenue', 'Profit', 'Status']}>
                  {report.orders.map(o => (
                    <tr key={o.id}>
                      <Td mono>{o.order_date}</Td>
                      <Td mono>{o.amazon_order_id}</Td>
                      <Td>{o.product_title ?? '—'}</Td>
                      <Td mono>${(o.selling_price ?? 0).toFixed(2)}</Td>
                      <Td><ProfitCell value={o.profit} /></Td>
                      <Td><Badge label={o.status} color={statusColor(o.status)} /></Td>
                    </tr>
                  ))}
                </Table>
              </Panel>
            </div>
          </>
        )}
      </div>
    </>
  )
}
