'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LLMProvidersPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|'delete'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('llm_providers').select('*', { count: 'exact' }).order('id', { ascending: false })
    setRows(data || []); setCount(c || 0); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setName(''); setError(''); setModal('create') }
  const openEdit = (r: any) => { setSelected(r); setName(r.name ?? ''); setError(''); setModal('edit') }
  const openDelete = (r: any) => { setSelected(r); setError(''); setModal('delete') }

  const handleSave = async () => {
    setSaving(true); setError('')
    const { error: e } = modal === 'create'
      ? await supabase.from('llm_providers').insert({ name })
      : await supabase.from('llm_providers').update({ name }).eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error: e } = await supabase.from('llm_providers').delete().eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Create · Read · Update · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>LLM Providers</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count} total</span>
          <button className="btn btn-primary" onClick={openCreate}>+ New Provider</button>
        </div>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.id}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{r.name || '—'}</span></td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn" onClick={() => openEdit(r)} style={{ padding: '3px 10px' }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => openDelete(r)} style={{ padding: '3px 10px' }}>Del</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No providers found.</div>}
        </div>
      )}
      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '400px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>{modal === 'create' ? 'New Provider' : 'Edit Provider'}</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', borderRadius: '2px' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>Name</div>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. OpenAI" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {modal === 'delete' && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '360px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Delete Provider?</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '20px' }}>Delete <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{selected.name}</span>?</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '12px', fontSize: '12px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}