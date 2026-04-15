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
    { count: featuredCaptions },
    { data: recentCaptions },
    { data: topCaptions },
    { data: flavorMix },
    { data: profile },
    { data: ratingStats },
  ] = await Promise.all([
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
    supabase.from('llm_model_responses').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('captions').select('id, content, created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(5),
    supabase.from('captions').select('content, like_count').order('like_count', { ascending: false }).limit(5),
    supabase.from('humor_flavor_mix').select('humor_flavor_id, caption_count, humor_flavors(slug)'),
    supabase.from('profiles').select('first_name').eq('id', user?.id ?? '').single(),
    supabase.from('captions').select('like_count').gt('like_count', 0).order('like_count', { ascending: false }).limit(500),
  ])

  const avgCaptionsPerImage = totalImages && totalCaptions ? (totalCaptions / totalImages).toFixed(1) : '—'
  const totalLikes = ratingStats?.reduce((sum, c) => sum + (c.like_count ?? 0), 0) ?? 0
  const ratedCaptions = ratingStats?.length ?? 0
  const avgLikes = ratedCaptions > 0 ? (totalLikes / ratedCaptions).toFixed(1) : '0'
  const topLikeCount = ratingStats?.[0]?.like_count ?? 0

  const rankStyle = (i: number) => ({
    bg: i === 0 ? 'rgba(255,215,0,0.15)' : i === 1 ? 'rgba(192,192,192,0.15)' : i === 2 ? 'rgba(205,127,50,0.15)' : 'transparent',
    color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-dimmer)',
  })

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

  const ratingStatsCards = [
    { label: 'Captions Rated', value: ratedCaptions.toLocaleString(), color: '#ff6eb4', icon: '♥' },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), color: '#ffb84d', icon: '👍' },
    { label: 'Avg Likes / Caption', value: avgLikes, color: '#4dffd2', icon: '📈' },
    { label: 'Featured Captions', value: featuredCaptions?.toLocaleString() ?? '—', color: '#c8f542', icon: '⭐' },
    { label: 'Top Caption Likes', value: topLikeCount.toLocaleString(), color: '#b57bff', icon: '🏆' },
  ]

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

      {/* Platform Stats */}
      <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Platform Overview</div>
        </div>
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

      {/* Caption Rating Stats */}
      <div style={{ padding: '28px 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '3px', height: '16px', background: '#ff6eb4', borderRadius: '2px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Caption Rating Statistics</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {ratingStatsCards.map(({ label, value, color, icon }) => (
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

        {/* Top Rated Leaderboard */}
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '12px' }}>🏆 Top Rated Captions</div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {topCaptions && topCaptions.length > 0 ? topCaptions.map((c, i) => {
            const { bg, color } = rankStyle(i)
            return (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: i < topCaptions.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{
                  fontSize: '12px', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', background: bg, color, fontWeight: '800', flexShrink: 0
                }}>#{i+1}</span>
                <div style={{ flex: 1, fontSize: '13px', color: 'var(--text)', fontFamily: 'var(--sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.content}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  <span style={{ color: '#ff6eb4' }}>♥</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#ff6eb4', fontFamily: 'var(--mono)' }}>{c.like_count ?? 0}</span>
                </div>
              </div>
            )
          }) : (
            <div style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dimmer)' }}>No rated captions yet.</div>
          )}
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
                    <div style={{ height: '100%', width: `${pct}%`, background: step.color, borderRadius: '99px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two column: flavor mix + recent captions */}
      <div style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '3px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Recent Captions</div>
          </div>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {recentCaptions && recentCaptions.length > 0 ? recentCaptions.map((c, i) => (
              <div key={c.id} style={{
                padding: '14px 16px',
                borderBottom: i < recentCaptions.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dimmer)', width: '16px' }}>#{i+1}</span>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: 'var(--text)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>"{c.content}"</div>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-dimmer)', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                  {new Date(c.created_datetime_utc).toLocaleDateString()}
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dimmer)' }}>No captions found.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}