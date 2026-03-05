import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalVotes },
    { data: recentImages },
    { data: recentCaptions },
    { data: voteBreakdown },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('id, url, description, created_at_utc').order('created_at_utc', { ascending: false }).limit(5),
    supabase.from('captions').select('id, content, image_id, created_at_utc').order('created_at_utc', { ascending: false }).limit(8),
    supabase.from('caption_votes').select('vote_value'),
    supabase.from('profiles').select('id, username, email, created_at_utc, is_superadmin').order('created_at_utc', { ascending: false }).limit(5),
  ])

  const upvotes = voteBreakdown?.filter(v => v.vote_value === 1).length ?? 0
  const downvotes = voteBreakdown?.filter(v => v.vote_value === -1).length ?? 0
  const voteTotal = upvotes + downvotes
  const upvotePct = voteTotal > 0 ? Math.round((upvotes / voteTotal) * 100) : 0
  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '4px' }}>Overview</div>
          <h1 style={{ fontSize: '22px', fontWeight: '500' }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="stat-grid" style={{ border: '1px solid var(--border)' }}>
          {[
            { label: 'Total Images', value: totalImages?.toLocaleString() ?? '—', accent: true },
            { label: 'Total Captions', value: totalCaptions?.toLocaleString() ?? '—' },
            { label: 'Registered Users', value: totalUsers?.toLocaleString() ?? '—' },
            { label: 'Total Votes', value: totalVotes?.toLocaleString() ?? '—' },
            { label: 'Avg Captions / Image', value: avgCaptionsPerImage },
            { label: 'Upvote Rate', value: `${upvotePct}%` },
          ].map(({ label, value, accent }) => (
            <div key={label} className="stat-card">
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: '600', color: accent ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Audience Sentiment</div>
        <div style={{ display: 'flex', height: '8px', borderRadius: '2px', overflow: 'hidden', background: 'var(--red-dim)', border: '1px solid var(--border)' }}>
          <div style={{ width: `${upvotePct}%`, background: 'var(--accent)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '10px' }}>
          <span style={{ color: 'var(--accent)' }}>↑ {upvotePct}% upvotes</span>
          <span style={{ color: 'var(--red)' }}>{100 - upvotePct}% downvotes ↓</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
        <div style={{ borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Captions</div>
          {recentCaptions?.map(c => (
            <div key={c.id} style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.content}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginTop: '3px' }}>{new Date(c.created_at_utc).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Users</div>
          {recentUsers?.map(u => (
            <div key={u.id} style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500' }}>{u.username || '(no username)'}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)' }}>{u.email || u.id.slice(0, 16) + '…'}</div>
              </div>
              {u.is_superadmin && <span className="badge badge-amber">admin</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Images</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--border)', padding: '1px' }}>
          {recentImages?.map(img => (
            <div key={img.id} style={{ background: 'var(--bg-panel)', padding: '12px' }}>
              {img.url && <img src={img.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: '1px solid var(--border)', borderRadius: '2px' }} />}
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.id.slice(0, 12)}…</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
