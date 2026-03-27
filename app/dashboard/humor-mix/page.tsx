'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HumorMixPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [editVals, setEditVals] = useState<Record<string,any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    load()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? '')
    })
  }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('humor_flavor_mix').select('*').order('id')
    setRows(data || [])
    setLoading(false)
  }

  const openEdit = (row: any) => { setEditing(row); setEditVals({ ...row }); setError('') }

  const handleSave = async () => {
    setSaving(true); setError('')
    const { error: e } = await supabase.from('humor_flavor_mix').update({
      ...editVals,
      modified_by_user_id: userId,
    }).eq('id', editing.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setEditing(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Read · Update</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Humor Mix</h1>
        </div>
        <span className="badge badge-dim">{rows.length} records</span>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Humor Flavor ID</th><th>Caption Count</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.id}</td>
                  <td>{r.humor_flavor_id}</td>
                  <td>{r.caption_count}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><button className="btn" onClick={() => openEdit(r)} style={{ padding: '3px 10px' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No records found.</div>}
        </div>
      )}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '400px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>Edit Record</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px' }}>{error}</div>}
            {['humor_flavor_id', 'caption_count'].map(k => (
              <div key={k} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>{k}</div>
                <input className="input" value={editVals[k] ?? ''} onChange={e => setEditVals(v => ({ ...v, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}