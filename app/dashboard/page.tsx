import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { data: recentCaptions },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('id, content, image_id, created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(10),
  ])

  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'

  const stats = [
    { label: 'Total Images', value: totalImages?.toLocaleString() ?? '—', color: '#b57bff' },
    { label: 'Total Captions', value: totalCaptions?.toLocaleString() ?? '—', color: '#ff6eb4' },
    { label: 'Registered Users', value: totalUsers?.toLocaleString() ?? '—', color: '#4dffd2' },
    { label: 'Avg Captions / Image', value: avgCaptionsPerImage, color: '#ffb84d' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Overview</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4dffd2', boxShadow: '0 0 8px #4dffd2' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#4dffd2', letterSpacing: '0.15em' }}>LIVE</span>
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

      <div>
        <div style={{ padding: '16px 28px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Recent Captions</div>
        {recentCaptions && recentCaptions.length > 0 ? recentCaptions.map(c => (
          <div key={c.id} style={{ padding: '14px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)' }}>{c.content}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', marginLeft: '16px', whiteSpace: 'nowrap' }}>{new Date(c.created_datetime_utc).toLocaleDateString()}</div>
          </div>
        )) : (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No captions found.</div>
        )}
      </div>
    </div>
  )
}