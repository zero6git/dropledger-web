'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { Panel, KpiCard, Table, Td, Topbar, Loading, ErrorMsg } from '@/components/ui'

interface GSTReport {
  period: { month: number; year: number; from: string; to: string }
  totalPurchases: number
  totalITC: number
  totalGSTCollected: number
  netRemittance: number
  itcDetails: Array<{ id: string; supplier_name: string; purchase_date: string; product_cost: number; gst_hst_paid: number }>
}

export default function TaxPage() {
  const { getToken } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState<GSTReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const data = await api.get(`/api/v1/reports/gst?month=${month}&year=${year}`, token!)
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
      <Topbar title="GST / HST Report">
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              <KpiCard label="Input Tax Credits (ITC)" value={`$${report.totalITC.toFixed(2)}`}          sub="What you claim back from CRA" color="green" />
              <KpiCard label="GST Collected"           value={`$${report.totalGSTCollected.toFixed(2)}`} sub="Estimated from Amazon sales" color="blue" />
              <KpiCard
                label="Net Remittance"
                value={`$${Math.abs(report.netRemittance).toFixed(2)}`}
                sub={report.netRemittance > 0 ? 'You owe CRA' : 'CRA owes you'}
                color={report.netRemittance > 0 ? 'red' : 'green'}
              />
            </div>

            <Panel title={`ITC Details — ${report.totalPurchases} purchases`}>
              <Table headers={['Date', 'Supplier', 'Product Cost', 'GST/HST Paid']}>
                {report.itcDetails.map(p => (
                  <tr key={p.id}>
                    <Td mono>{p.purchase_date}</Td>
                    <Td>{p.supplier_name}</Td>
                    <Td mono>${(p.product_cost ?? 0).toFixed(2)}</Td>
                    <Td mono style={{ color: 'var(--accent)' }}>+${(p.gst_hst_paid ?? 0).toFixed(2)}</Td>
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
