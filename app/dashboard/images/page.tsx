import { createClient } from '@/lib/supabase/server'

export default async function ImagesPage() {
  const supabase = await createClient()
  const { data: images, count } = await supabase
    .from('images')
    .select('*', { count: 'exact' })
    .order('created_at_utc', { ascending: false })
    .limit(50)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Read · Update · Delete</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Images</h1>
        </div>
        <span className="badge badge-dim">{count?.toLocaleString()} total</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Preview</th><th>ID</th><th>Description</th><th>Owner</th><th>Created</th></tr></thead>
          <tbody>
            {images?.map(img => (
              <tr key={img.id}>
                <td>{img.url ? <img src={img.url} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} /> : '—'}</td>
                <td style={{ color: 'var(--text-dimmer)' }}>{img.id.slice(0, 8)}…</td>
                <td style={{ color: img.description ? 'var(--text)' : 'var(--text-dimmer)' }}>{img.description ? img.description.slice(0, 60) + (img.description.length > 60 ? '…' : '') : '—'}</td>
                <td style={{ color: 'var(--text-dimmer)' }}>{img.user_id ? img.user_id.slice(0, 8) + '…' : '—'}</td>
                <td style={{ color: 'var(--text-dimmer)' }}>{new Date(img.created_at_utc).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!images || images.length === 0) && (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No images found.</div>
        )}
      </div>
    </div>
  )
}
