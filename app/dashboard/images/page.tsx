'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'

type Image = { id: string; url: string | null; description: string | null; user_id: string | null; created_at_utc: string }

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchImages = useCallback(async () => {
    setLoading(true)
    const { data, count: total } = await supabase.from('images').select('*', { count: 'exact' }).order('created_at_utc', { ascending: false }).limit(50)
    setImages(data ?? [])
    setCount(total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  async function handleCreate() {
    if (!newUrl.trim()) { setError('URL is required'); return }
    setSubmitting(true); setError(null)
    const { error: err } = await supabase.from('images').insert({ url: newUrl.trim(), description: newDesc.trim() || null })
    if (err) { setError(err.message) } else { setNewUrl(''); setNewDesc(''); setCreating(false); fetchImages() }
    setSubmitting(false)
  }

  async function handleUpdate(id: string) {
    setSubmitting(true); setError(null)
    const { error: err } = await supabase.from('images').update({ description: editDesc }).eq('id', id)
    if (err) { setError(err.message) } else { setEditingId(null); fetchImages() }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return
    setDeletingId(id)
    await supabase.from('images').delete().eq('id', id)
    setDeletingId(null); fetchImages()
  }

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '4px' }}>Create · Read · Update · Delete</div>
          <h1 style={{ fontSize: '22px', fontWeight: '500' }}>Images</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count.toLocaleString()} total</span>
          <button className="btn btn-primary" onClick={() => { setCreating(true); setError(null) }}>+ New Image</button>
        </div>
      </div>

      {error && <div style={{ margin: '16px 24px', padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '2px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--red)' }}>{error}</div>}

      {creating && (
        <div style={{ margin: '16px 24px', padding: '20px', background: 'var(--bg-panel)', border: '1px solid var(--accent)', borderRadius: '2px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>New Image</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input className="input" placeholder="Image URL (https://…)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            <textarea className="input" placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
              <button className="btn" onClick={() => { setCreating(false); setError(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>Loading…</div> : (
          <table className="data-table">
            <thead><tr><th>Preview</th><th>ID</th><th>Description</th><th>Owner</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {images.map(img => (
                <tr key={img.id}>
                  <td>{img.url ? <img src={img.url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--border)', borderRadius: '2px' }} /> : '—'}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{img.id.slice(0, 8)}…</td>
                  <td>
                    {editingId === img.id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <textarea className="input" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} style={{ minWidth: '200px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button className="btn btn-primary" onClick={() => handleUpdate(img.id)} disabled={submitting} style={{ fontSize: '10px', padding: '4px 10px' }}>Save</button>
                          <button className="btn" onClick={() => setEditingId(null)} style={{ fontSize: '10px', padding: '4px 10px' }}>✕</button>
                        </div>
                      </div>
                    ) : <span style={{ color: img.description ? 'var(--text)' : 'var(--text-dimmer)' }}>{img.description ? img.description.slice(0, 60) + (img.description.length > 60 ? '…' : '') : '—'}</span>}
                  </td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{img.user_id ? img.user_id.slice(0, 8) + '…' : '—'}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{new Date(img.created_at_utc).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {editingId !== img.id && <button className="btn" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => { setEditingId(img.id); setEditDesc(img.description ?? '') }}>Edit</button>}
                      <button className="btn btn-danger" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleDelete(img.id)} disabled={deletingId === img.id}>{deletingId === img.id ? '…' : 'Del'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
