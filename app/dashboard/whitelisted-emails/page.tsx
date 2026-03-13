'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WhitelistedEmailsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'delete'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('whitelist_email_addresses').select('*', { count: 'exact' }).order('id', { ascending: false })
    setRows(data || []); setCount(c || 0); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true); setError('')
    const { error: e } = await supabase.from('whitelist_email_addresses').insert({ email_address: email })
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setEmail(''); setModal(null); load()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error: e } = await supabase.from('whitelist_email_addresses').delete().eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Create · Read · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Whitelisted Emails</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count} total</span>
          <button className="btn btn-primary" onClick={() => { setEmail(''); setError(''); setModal('create') }}>+ Add Email</button>
        </div>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.id}</td>
                  <td><span style={{ fontFamily: 'var(--mono)' }}>{r.email_address}</span></td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-danger" onClick={() => { setSelected(r); setError(''); setModal('delete') }} style={{ padding: '3px 10px' }}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No whitelisted emails.</div>}
        </div>
      )}
      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '400px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>Add Whitelisted Email</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', borderRadius: '2px' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>Email Address</div>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
      {modal === 'delete' && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '360px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Remove Email?</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '20px' }}>Remove <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{selected.email_address}</span>?</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '12px', fontSize: '12px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Removing…' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}