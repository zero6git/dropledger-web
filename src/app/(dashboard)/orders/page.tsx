'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { Panel, Badge, ProfitCell, Table, Td, Topbar, Btn, Loading, ErrorMsg, statusColor, FormInput, FormSelect } from '@/components/ui'

interface Order {
  id: string
  amazon_order_id: string
  product_title: string
  selling_price: number
  amazon_fees: number
  profit: number
  status: string
  order_date: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'loss', label: 'Loss' },
]

const EMPTY_FORM = { amazon_order_id: '', order_date: new Date().toISOString().slice(0,10), product_title: '', asin: '', selling_price: '', amazon_fees: '', status: 'pending', notes: '' }

export default function OrdersPage() {
  const { getToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    const token = await getToken()
    if (!token) return
    try {
      const res = await api.get('/api/v1/orders?limit=100', token)
      setOrders(res.orders ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [getToken])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      await api.post('/api/v1/orders', token!, {
        ...form,
        selling_price: parseFloat(form.selling_price),
        amazon_fees:   parseFloat(form.amazon_fees),
      })
      setShowForm(false)
      setForm(EMPTY_FORM)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create order')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this order?')) return
    const token = await getToken()
    await api.delete(`/api/v1/orders/${id}`, token!)
    load()
  }

  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <>
      <Topbar title="Orders">
        <Btn variant="primary" onClick={() => setShowForm(true)}>+ New Order</Btn>
      </Topbar>
      <div style={{ padding: 28 }}>
        {error && <ErrorMsg msg={error} />}

        {showForm && (
          <Panel title="New Order" style={{ marginBottom: 20 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 20 }}>
                <FormInput label="Amazon Order ID" name="amazon_order_id" value={form.amazon_order_id} onChange={f('amazon_order_id')} required />
                <FormInput label="Order Date" name="order_date" type="date" value={form.order_date} onChange={f('order_date')} required />
                <FormInput label="Product Title" name="product_title" value={form.product_title} onChange={f('product_title')} />
                <FormInput label="ASIN" name="asin" value={form.asin} onChange={f('asin')} />
                <FormInput label="Selling Price ($)" name="selling_price" type="number" value={form.selling_price} onChange={f('selling_price')} required />
                <FormInput label="Amazon Fees ($)" name="amazon_fees" type="number" value={form.amazon_fees} onChange={f('amazon_fees')} required />
                <FormSelect label="Status" name="status" value={form.status} onChange={f('status')} options={STATUS_OPTIONS} />
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit" disabled={saving}>Save Order</Btn>
              </div>
            </form>
          </Panel>
        )}

        <Panel title={`Orders (${orders.length})`}>
          {loading ? <Loading /> : (
            <Table headers={['Date', 'Order ID', 'Product', 'Revenue', 'Fees', 'Profit', 'Status', '']}>
              {orders.map(o => (
                <tr key={o.id}>
                  <Td mono>{o.order_date}</Td>
                  <Td mono>{o.amazon_order_id}</Td>
                  <Td>{o.product_title ?? '—'}</Td>
                  <Td mono>${(o.selling_price ?? 0).toFixed(2)}</Td>
                  <Td mono style={{ color: 'var(--warn)' }}>−${(o.amazon_fees ?? 0).toFixed(2)}</Td>
                  <Td><ProfitCell value={o.profit} /></Td>
                  <Td><Badge label={o.status} color={statusColor(o.status)} /></Td>
                  <Td>
                    <button onClick={() => handleDelete(o.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </>
  )
}
