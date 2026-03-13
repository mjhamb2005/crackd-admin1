'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ImagesPage() {
  const supabase = createClient()
  const [images, setImages] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|'delete'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ url: '', image_description: '', is_public: true })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('images').select('*', { count: 'exact' }).order('created_datetime_utc', { ascending: false }).limit(100)
    setImages(data || []); setCount(c || 0); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ url: '', image_description: '', is_public: true }); setError(''); setModal('create') }
  const openEdit = (r: any) => { setSelected(r); setForm({ url: r.url ?? '', image_description: r.image_description ?? '', is_public: r.is_public ?? true }); setError(''); setModal('edit') }
  const openDelete = (r: any) => { setSelected(r); setError(''); setModal('delete') }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('images').upload(path, file)
    if (upErr) { setError(upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
    setForm(f => ({ ...f, url: publicUrl }))
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const payload = { url: form.url || null, image_description: form.image_description || null, is_public: form.is_public }
    const { error: e } = modal === 'create'
      ? await supabase.from('images').insert(payload)
      : await supabase.from('images').update(payload).eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error: e } = await supabase.from('images').delete().eq('id', selected.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setModal(null); load()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Create · Read · Update · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Images</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-dim">{count.toLocaleString()} total</span>
          <button className="btn btn-primary" onClick={openCreate}>+ New Image</button>
        </div>
      </div>
      {loading ? <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dimmer)' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Preview</th><th>ID</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {images.map(img => (
                <tr key={img.id}>
                  <td>{img.url ? <img src={img.url} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} /> : <div style={{ width: '44px', height: '44px', background: 'var(--border)', borderRadius: '4px' }} />}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{img.id.slice(0,8)}…</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.image_description || '—'}</td>
                  <td>{img.is_public ? <span className="badge badge-green">public</span> : <span className="badge badge-dim">private</span>}</td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{img.created_datetime_utc ? new Date(img.created_datetime_utc).toLocaleDateString() : '—'}</td>
                  <td><div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn" onClick={() => openEdit(img)} style={{ padding: '3px 10px' }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => openDelete(img)} style={{ padding: '3px 10px' }}>Del</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length === 0 && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No images found.</div>}
        </div>
      )}
      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', width: '480px', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>{modal === 'create' ? 'New Image' : 'Edit Image'}</div>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', borderRadius: '2px' }}>{error}</div>}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>URL</div>
              <input className="input" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>Upload File</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
              <button className="btn" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : '↑ Upload Image'}</button>
              {form.url && <div style={{ marginTop: '8px' }}><img src={form.url} alt="" style={{ height: '60px', borderRadius: '4px', border: '1px solid var(--border)' }} /></div>}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dimmer)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>Description</div>
              <textarea className="input" value={form.image_description} onChange={e => setForm(f => ({ ...f, image_description: e.target.value }))} />
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="is_public" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
              <label htmlFor="is_public" style={{ fontSize: '12px', fontFamily: 'var(--mono)' }}>Public</label>
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
            <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Delete Image?</div>
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