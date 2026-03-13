'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AllowedDomainsPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'delete'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('allowed_signup_domains').select('*', { count: 'exact' }).order('id', { ascending: false })
    setRows(data || []); setCount(c || 0); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true); setError('')
    const { error: e } = await supabase.from('allowed_signup_domains').insert({ apex_domain: domain })
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setDomain(''); setModal(null); load()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error: e } = await supabase.from('allowed_signup_domains').delete().eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Create · Read · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Allowed Signup Domains</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count} total</span>
          <button className="btn btn-primary" onClick={() => { setDomain(''); setError(''); setModal('create') }}>+ Add Domain</button>
        </div>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Domain</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.id}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{r.apex_domain}</span></td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-danger" onClick={() => { setSelected(r); setError(''); setModal('delete') }} style={{ padding: '3px 10px' }}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No allowed domains.</div>}
        </div>
      )}
      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '400px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>Add Allowed Domain</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', borderRadius: '2px' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>Apex Domain (e.g. columbia.edu)</div>
              <input className="input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.edu" />
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
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Remove Domain?</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '20px' }}>Remove <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{selected.apex_domain}</span>?</div>
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