'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CaptionExamplesPage() {
  const supabase = createClient()
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|'delete'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ image_id: '', image_description: '', caption: '', explanation: '', priority: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('caption_examples').select('*', { count: 'exact' }).order('id', { ascending: false }).limit(200)
    setRows(data || []); setCount(c || 0); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const blank = { image_id: '', image_description: '', caption: '', explanation: '', priority: '' }
  const openCreate = () => { setForm(blank); setError(''); setModal('create') }
  const openEdit = (r: any) => { setSelected(r); setForm({ image_id: r.image_id ?? '', image_description: r.image_description ?? '', caption: r.caption ?? '', explanation: r.explanation ?? '', priority: r.priority ?? '' }); setError(''); setModal('edit') }
  const openDelete = (r: any) => { setSelected(r); setError(''); setModal('delete') }

  const handleSave = async () => {
    setSaving(true); setError('')
    const payload = { image_id: form.image_id || null, image_description: form.image_description || null, caption: form.caption || null, explanation: form.explanation || null, priority: form.priority ? Number(form.priority) : null }
    const { error: e } = modal === 'create'
      ? await supabase.from('caption_examples').insert(payload)
      : await supabase.from('caption_examples').update(payload).eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error: e } = await supabase.from('caption_examples').delete().eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Create · Read · Update · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Caption Examples</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count} total</span>
          <button className="btn btn-primary" onClick={openCreate}>+ New Example</button>
        </div>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Caption</th><th>Image Description</th><th>Priority</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.id}</td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.caption || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-dim)' }}>{r.image_description || '—'}</td>
                  <td>{r.priority ?? '—'}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn" onClick={() => openEdit(r)} style={{ padding: '3px 10px' }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => openDelete(r)} style={{ padding: '3px 10px' }}>Del</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No caption examples found.</div>}
        </div>
      )}
      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '480px', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>{modal === 'create' ? 'New Caption Example' : 'Edit Caption Example'}</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', borderRadius: '2px' }}>{error}</div>}
            {[['image_id','Image ID'],['image_description','Image Description'],['caption','Caption'],['explanation','Explanation'],['priority','Priority']].map(([k,l]) => (
              <div key={k} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>{l}</div>
                {k === 'image_description' || k === 'explanation' || k === 'caption'
                  ? <textarea className="input" value={(form as any)[k]} onChange={e => setForm(v => ({ ...v, [k]: e.target.value }))} />
                  : <input className="input" value={(form as any)[k]} onChange={e => setForm(v => ({ ...v, [k]: e.target.value }))} />}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {modal === 'delete' && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '360px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Delete Example?</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '20px' }}>This cannot be undone.</div>
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