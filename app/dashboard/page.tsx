import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalRequests },
    { count: totalLLMResponses },
    { count: publicCaptions },
    { data: recentCaptions },
    { data: topCaptions },
    { data: flavorMix },
    { data: profile },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
    supabase.from('llm_model_responses').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('id, content, created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(5),
    supabase.from('captions').select('content, like_count').order('like_count', { ascending: false }).limit(5),
    supabase.from('humor_flavor_mix').select('humor_flavor_id, caption_count, humor_flavors(slug)'),
    supabase.from('profiles').select('first_name').eq('id', user?.id ?? '').single(),
  ])

  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'

  const stats = [
    { label: 'Images', value: totalImages?.toLocaleString() ?? '—', color: '#b57bff', icon: '🖼' },
    { label: 'Captions', value: totalCaptions?.toLocaleString() ?? '—', color: '#ff6eb4', icon: '💬' },
    { label: 'Users', value: totalUsers?.toLocaleString() ?? '—', color: '#4dffd2', icon: '👤' },
    { label: 'Requests', value: totalRequests?.toLocaleString() ?? '—', color: '#ffb84d', icon: '⚡' },
    { label: 'Avg / Image', value: avgCaptionsPerImage, color: '#60a5fa', icon: '📊' },
  ]

  const pipelineSteps = [
    { label: 'Requests', value: totalRequests ?? 0, color: '#60a5fa' },
    { label: 'LLM Calls', value: totalLLMResponses ?? 0, color: '#b57bff' },
    { label: 'Captions', value: totalCaptions ?? 0, color: '#ff6eb4' },
    { label: 'Public', value: publicCaptions ?? 0, color: '#c8f542' },
  ]
  const maxPipeline = Math.max(...pipelineSteps.map(s => s.value), 1)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: 'var(--mono)' }}>

      {/* Header */}
      <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '6px' }}>crackd. · admin console</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>Welcome back, {profile?.first_name ?? 'Admin'} 👋</div>
            <h1 style={{
              fontFamily: 'var(--sans)', fontSize: '36px', fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em', lineHeight: 1
            }}>Overview</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(77,255,210,0.08)', border: '1px solid rgba(77,255,210,0.2)', borderRadius: '999px', padding: '6px 14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4dffd2', boxShadow: '0 0 8px #4dffd2' }} />
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

      {/* Pipeline Funnel */}
      <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '3px', height: '16px', background: '#60a5fa', borderRadius: '2px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Pipeline Conversion</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pipelineSteps.map((step, i) => {
              const pct = Math.round((step.value / maxPipeline) * 100)
              const convPct = i > 0 && pipelineSteps[i-1].value > 0
                ? Math.round((step.value / pipelineSteps[i-1].value) * 100)
                : null
              return (
                <div key={step.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-dimmer)', width: '20px' }}>0{i+1}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{step.label}</span>
                      {convPct !== null && (
                        <span style={{ fontSize: '10px', color: step.color, background: `${step.color}15`, padding: '2px 6px', borderRadius: '3px' }}>
                          {convPct}% conversion
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: step.color, fontFamily: 'var(--mono)' }}>
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: step.color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two column: top captions + flavor mix */}
      <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Top Captions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '3px', height: '16px', background: '#ff6eb4', borderRadius: '2px' }} />
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Top Captions by Likes</div>
          </div>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {topCaptions && topCaptions.length > 0 ? topCaptions.map((c, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                borderBottom: i < topCaptions.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '11px', color: i === 0 ? '#c8f542' : 'var(--text-dimmer)', width: '20px', fontWeight: '700' }}>#{i+1}</span>
                <div style={{ flex: 1, fontSize: '12px', color: 'var(--text)', fontFamily: 'var(--sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.content}</div>
                <span style={{ fontSize: '11px', color: '#ff6eb4', whiteSpace: 'nowrap', fontFamily: 'var(--mono)' }}>♥ {c.like_count ?? 0}</span>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dimmer)' }}>No data yet.</div>
            )}
          </div>
        </div>

        {/* Flavor Mix */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '3px', height: '16px', background: '#b57bff', borderRadius: '2px' }} />
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Active Humor Mix</div>
          </div>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {flavorMix && flavorMix.length > 0 ? flavorMix.map((f: any, i: number) => (
              <div key={i} style={{
                padding: '14px 16px',
                borderBottom: i < flavorMix.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                  {(f.humor_flavors as any)?.slug || `flavor-${f.humor_flavor_id}`}
                </div>
                <div style={{
                  background: 'rgba(200,245,66,0.1)', border: '1px solid rgba(200,245,66,0.2)',
                  borderRadius: '4px', padding: '3px 10px',
                  fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--mono)'
                }}>×{f.caption_count}</div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dimmer)' }}>No flavor mix configured.</div>
            )}
          </div>
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
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dimmer)', width: '16px' }}>#{i+1}</span>
                <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>"{c.content}"</div>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-dimmer)', marginLeft: '16px', whiteSpace: 'nowrap' }}>
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