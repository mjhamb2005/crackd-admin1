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
    supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('id, url, image_description, created_datetime_utc').eq('is_public', true).order('created_datetime_utc', { ascending: false }).limit(5),
    supabase.from('captions').select('id, content, image_id, created_datetime_utc').eq('is_public', true).order('created_datetime_utc', { ascending: false }).limit(8),
    supabase.from('caption_votes').select('vote_value'),
    supabase.from('profiles').select('id, username, email, created_datetime_utc, is_superadmin').order('created_datetime_utc', { ascending: false }).limit(5),
  ])

  const upvotes = voteBreakdown?.filter(v => v.vote_value === 1).length ?? 0
  const downvotes = voteBreakdown?.filter(v => v.vote_value === -1).length ?? 0
  const voteTotal = upvotes + downvotes
  const upvotePct = voteTotal > 0 ? Math.round((upvotes / voteTotal) * 100) : 0
  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'

  const stats = [
    { label: 'Total Images', value: totalImages?.toLocaleString() ?? '—', color: '#b57bff' },
    { label: 'Total Captions', value: totalCaptions?.toLocaleString() ?? '—', color: '#ff6eb4' },
    { label: 'Registered Users', value: totalUsers?.toLocaleString() ?? '—', color: '#4dffd2' },
    { label: 'Total Votes', value: totalVotes?.toLocaleString() ?? '—', color: '#ffb84d' },
    { label: 'Avg Captions / Image', value: avgCaptionsPerImage, color: '#b57bff' },
    { label: 'Upvote Rate', value: `${upvotePct}%`, color: '#4dffd2' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Overview</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--teal)', letterSpacing: '0.15em' }}>LIVE</span>
        </div>
      </div>

      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
        <div className="stat-grid" style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {stats.map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '32px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Audience Sentiment</div>
        <div style={{ display: 'flex', height: '10px', borderRadius: '99px', overflow: 'hidden', background: 'var(--red-dim)', border: '1px solid var(--border)' }}>
          <div style={{ width: `${upvotePct}%`, background: 'linear-gradient(90deg, #7c3aed, #4dffd2)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--mono)', fontSize: '10px' }}>
          <span style={{ color: 'var(--accent)' }}>↑ {upvotePct}% upvotes ({upvotes.toLocaleString()})</span>
          <span style={{ color: 'var(--red)' }}>{100 - upvotePct}% downvotes ({downvotes.toLocaleString()}) ↓</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
        <div style={{ borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 28px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Recent Captions</div>
          {recentCaptions?.map(c => (
            <div key={c.id} style={{ padding: '12px 28px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.content}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginTop: '4px' }}>{new Date(c.created_datetime_utc).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ padding: '16px 28px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Recent Users</div>
          {recentUsers?.map(u => (
            <div key={u.id} style={{ padding: '12px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{u.username || '(no username)'}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)' }}>{u.email || u.id.slice(0, 16) + '…'}</div>
              </div>
              {u.is_superadmin && <span className="badge badge-purple">admin</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ padding: '16px 28px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Recent Images</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {recentImages?.map(img => (
            <div key={img.id} style={{ background: 'var(--bg-panel)', padding: '12px' }}>
              {img.url && <img src={img.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />}
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.image_description || img.id.slice(0, 12) + '…'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
