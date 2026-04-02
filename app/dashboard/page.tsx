import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { data: recentCaptions },
    { count: totalRequests },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('id, content, created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(5),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
  ])

  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'

  const stats = [
    { label: 'Images', value: totalImages?.toLocaleString() ?? '—', color: '#b57bff', icon: '🖼' },
    { label: 'Captions', value: totalCaptions?.toLocaleString() ?? '—', color: '#ff6eb4', icon: '💬' },
    { label: 'Users', value: totalUsers?.toLocaleString() ?? '—', color: '#4dffd2', icon: '👤' },
    { label: 'Requests', value: totalRequests?.toLocaleString() ?? '—', color: '#ffb84d', icon: '⚡' },
    { label: 'Avg / Image', value: avgCaptionsPerImage, color: '#60a5fa', icon: '📊' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: 'var(--mono)' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>crackd. · admin console</div>
            <h1 style={{
              fontFamily: 'var(--sans)', fontSize: '36px', fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em', lineHeight: 1
            }}>Overview</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(77,255,210,0.08)', border: '1px solid rgba(77,255,210,0.2)', borderRadius: '999px', padding: '6px 14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4dffd2', boxShadow: '0 0 8px #4dffd2', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '10px', color: '#4dffd2', letterSpacing: '0.15em' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {stats.map(({ label, value, color, icon }) => (
            <div key={label} style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color }} />
              <div style={{ fontSize: '20px', marginBottom: '12px' }}>{icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--sans)', color, lineHeight: 1, marginBottom: '6px' }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Captions */}
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Recent Captions</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {recentCaptions && recentCaptions.length > 0 ? recentCaptions.map((c, i) => (
            <div key={c.id} style={{
              padding: '16px 20px',
              borderBottom: i < recentCaptions.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'background 0.15s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', width: '16px' }}>#{i + 1}</span>
                <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>"{c.content}"</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                {new Date(c.created_datetime_utc).toLocaleDateString()}
              </div>
            </div>
          )) : (
            <div style={{ padding: '48px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dimmer)' }}>No captions found.</div>
          )}
        </div>
      </div>
    </div>
  )
}