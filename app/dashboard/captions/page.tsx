import { createClient } from '@/lib/supabase/server'

export default async function CaptionsPage() {
  const supabase = await createClient()
  const { data, count } = await supabase.from('captions')
    .select('id, content, is_public, is_featured, like_count, humor_flavor_id, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false }).limit(200)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Read Only</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Captions</h1>
        </div>
        <span className="badge badge-dim">{count?.toLocaleString()} total</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Content</th>
              <th>Public</th>
              <th>Featured</th>
              <th>Likes</th>
              <th>Flavor</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id}>
                <td style={{ maxWidth: '400px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text)' }}>
                    {row.content || '—'}
                  </div>
                </td>
                <td>
                  {row.is_public
                    ? <span className="badge badge-green">public</span>
                    : <span className="badge badge-dim">private</span>}
                </td>
                <td>
                  {row.is_featured
                    ? <span className="badge" style={{ background: 'rgba(255,180,0,0.15)', color: '#ffb400', border: '1px solid rgba(255,180,0,0.3)' }}>⭐ featured</span>
                    : <span className="badge badge-dim">—</span>}
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: row.like_count > 0 ? 'var(--accent)' : 'var(--text-dimmer)' }}>
                    ♥ {row.like_count ?? 0}
                  </span>
                </td>
                <td style={{ color: 'var(--text-dimmer)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
                  {row.humor_flavor_id ?? '—'}
                </td>
                <td style={{ color: 'var(--text-dimmer)', fontFamily: 'var(--mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data || data.length === 0) && (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>
            No captions found.
          </div>
        )}
      </div>
    </div>
  )
}