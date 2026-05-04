'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { Panel, Badge, Table, Td, Topbar, Btn, Loading, ErrorMsg, statusColor, FormInput, FormSelect } from '@/components/ui'

interface Shipment {
  id: string
  order_id: string
  carrier: string
  tracking_number: string
  shipping_cost: number
  delivery_status: string
  ship_date: string
  estimated_delivery: string
}

interface Order { id: string; amazon_order_id: string }

const CARRIER_OPTIONS = [
  { value: 'canada_post', label: 'Canada Post' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'purolator', label: 'Purolator' },
  { value: 'dhl', label: 'DHL' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'label_created', label: 'Label Created' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'exception', label: 'Exception' },
]

const EMPTY = { order_id: '', carrier: 'canada_post', tracking_number: '', shipping_cost: '', delivery_status: 'label_created', ship_date: new Date().toISOString().slice(0,10), estimated_delivery: '' }

export default function ShipmentsPage() {
  const { getToken } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
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
      const [shp, ord] = await Promise.all([
        api.get('/api/v1/shipments', token),
        api.get('/api/v1/orders?limit=200', token),
      ])
      setShipments(shp ?? [])
      setOrders(ord.orders ?? [])
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
      await api.post('/api/v1/shipments', token!, { ...form, shipping_cost: parseFloat(form.shipping_cost) })
      setShowForm(false)
      setForm(EMPTY)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const orderOptions = [{ value: '', label: '— Select Order —' }, ...orders.map(o => ({ value: o.id, label: o.amazon_order_id }))]

  return (
    <>
      <Topbar title="Shipments">
        <Btn variant="primary" onClick={() => setShowForm(true)}>+ New Shipment</Btn>
      </Topbar>
      <div style={{ padding: 28 }}>
        {error && <ErrorMsg msg={error} />}

        {showForm && (
          <Panel title="New Shipment" style={{ marginBottom: 20 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: 20 }}>
                <FormSelect label="Order" name="order_id" value={form.order_id} onChange={f('order_id')} options={orderOptions} />
                <FormSelect label="Carrier" name="carrier" value={form.carrier} onChange={f('carrier')} options={CARRIER_OPTIONS} />
                <FormInput label="Tracking Number" name="tracking_number" value={form.tracking_number} onChange={f('tracking_number')} />
                <FormInput label="Shipping Cost ($)" name="shipping_cost" type="number" value={form.shipping_cost} onChange={f('shipping_cost')} required />
                <FormInput label="Ship Date" name="ship_date" type="date" value={form.ship_date} onChange={f('ship_date')} />
                <FormInput label="Est. Delivery" name="estimated_delivery" type="date" value={form.estimated_delivery} onChange={f('estimated_delivery')} />
                <FormSelect label="Status" name="delivery_status" value={form.delivery_status} onChange={f('delivery_status')} options={STATUS_OPTIONS} />
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit" disabled={saving}>Save Shipment</Btn>
              </div>
            </form>
          </Panel>
        )}

        <Panel title={`Shipments (${shipments.length})`}>
          {loading ? <Loading /> : (
            <Table headers={['Ship Date', 'Carrier', 'Tracking', 'Cost', 'Est. Delivery', 'Status']}>
              {shipments.map(s => (
                <tr key={s.id}>
                  <Td mono>{s.ship_date ?? '—'}</Td>
                  <Td>{s.carrier?.replace(/_/g, ' ')}</Td>
                  <Td mono>{s.tracking_number ?? '—'}</Td>
                  <Td mono>${(s.shipping_cost ?? 0).toFixed(2)}</Td>
                  <Td mono>{s.estimated_delivery ?? '—'}</Td>
                  <Td><Badge label={s.delivery_status?.replace(/_/g, ' ')} color={statusColor(s.delivery_status)} /></Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </>
  )
}
