'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { Panel, Table, Td, Topbar, Btn, Loading, ErrorMsg, FormInput, FormSelect } from '@/components/ui'

interface Purchase {
  id: string
  order_id: string
  supplier_name: string
  purchase_date: string
  product_cost: number
  gst_hst_paid: number
  payment_method: string
  receipt_url: string
}

interface Order { id: string; amazon_order_id: string }

const PAYMENT_OPTIONS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card',  label: 'Debit Card' },
  { value: 'paypal',      label: 'PayPal' },
  { value: 'other',       label: 'Other' },
]

const EMPTY = { order_id: '', supplier_name: '', purchase_date: new Date().toISOString().slice(0,10), product_cost: '', gst_hst_paid: '0', payment_method: 'credit_card' }

export default function PurchasesPage() {
  const { getToken } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const token = await getToken()
    if (!token) return
    try {
      const [pur, ord] = await Promise.all([
        api.get('/api/v1/purchases', token),
        api.get('/api/v1/orders?limit=200', token),
      ])
      setPurchases(pur ?? [])
      setOrders((ord.orders ?? []).map((o: Order) => ({ id: o.id, amazon_order_id: o.amazon_order_id })))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
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
      await api.post('/api/v1/purchases', token!, {
        ...form,
        product_cost: parseFloat(form.product_cost),
        gst_hst_paid: parseFloat(form.gst_hst_paid),
      })
      setShowForm(false)
      setForm(EMPTY)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this purchase?')) return
    const token = await getToken()
    await api.delete(`/api/v1/purchases/${id}`, token!)
    load()
  }

  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const orderOptions = [{ value: '', label: '— Select Order —' }, ...orders.map(o => ({ value: o.id, label: o.amazon_order_id }))]

  return (
    <>
      <Topbar title="Purchases">
        <Btn variant="primary" onClick={() => setShowForm(true)}>+ Add Purchase</Btn>
      </Topbar>
      <div style={{ padding: 28 }}>
        {error && <ErrorMsg msg={error} />}

        {showForm && (
          <Panel title="New Purchase" style={{ marginBottom: 20 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 20 }}>
                <FormSelect label="Order" name="order_id" value={form.order_id} onChange={f('order_id')} options={orderOptions} />
                <FormInput label="Supplier Name" name="supplier_name" value={form.supplier_name} onChange={f('supplier_name')} required />
                <FormInput label="Purchase Date" name="purchase_date" type="date" value={form.purchase_date} onChange={f('purchase_date')} required />
                <FormInput label="Product Cost ($)" name="product_cost" type="number" value={form.product_cost} onChange={f('product_cost')} required />
                <FormInput label="GST/HST Paid ($)" name="gst_hst_paid" type="number" value={form.gst_hst_paid} onChange={f('gst_hst_paid')} />
                <FormSelect label="Payment Method" name="payment_method" value={form.payment_method} onChange={f('payment_method')} options={PAYMENT_OPTIONS} />
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit" disabled={saving}>Save Purchase</Btn>
              </div>
            </form>
          </Panel>
        )}

        <Panel title={`Purchases (${purchases.length})`}>
          {loading ? <Loading /> : (
            <Table headers={['Date', 'Supplier', 'Order', 'Cost', 'GST/HST', 'Payment', '']}>
              {purchases.map(p => (
                <tr key={p.id}>
                  <Td mono>{p.purchase_date}</Td>
                  <Td>{p.supplier_name}</Td>
                  <Td mono>{p.order_id.slice(0, 8)}…</Td>
                  <Td mono style={{ color: 'var(--warn)' }}>−${(p.product_cost ?? 0).toFixed(2)}</Td>
                  <Td mono>${(p.gst_hst_paid ?? 0).toFixed(2)}</Td>
                  <Td>{p.payment_method?.replace('_', ' ')}</Td>
                  <Td>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
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
