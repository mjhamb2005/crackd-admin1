import { createClient } from '@/lib/supabase/server'

export default async function CaptionsPage() {
  const supabase = await createClient()

  const { data: captions, count } = await supabase
    .from('captions')
    .select('*', { count: 'exact' })
    .order('created_at_utc', { ascending: false })
    .limit(100)

  const { data: voteCounts } = await supabase.from('caption_votes').select('caption_id, vote_value')

  const voteMap: Record<string, { up: number; down: number }> = {}
  for (const v of voteCounts ?? []) {
    if (!voteMap[v.caption_id]) voteMap[v.caption_id] = { up: 0, down: 0 }
    if (v.vote_value === 1) voteMap[v.caption_id].up++
    else voteMap[v.caption_id].down++
  }

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '4px' }}>Read Only</div>
          <h1 style={{ fontSize: '22px', fontWeight: '500' }}>Captions</h1>
        </div>
        <span className="badge badge-dim">{count?.toLocaleString()} total</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Content</th>
              <th>Image ID</th>
              <th>Score</th>
              <th>Votes</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {captions?.map(cap => {
              const votes = voteMap[cap.id] ?? { up: 0, down: 0 }
              const score = votes.up - votes.down
              return (
                <tr key={cap.id}>
                  <td style={{ color: 'var(--text-dimmer)' }}>{cap.id.slice(0, 8)}…</td>
                  <td><div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--mono)', fontSize: '11px' }}>{cap.content || '—'}</div></td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{cap.image_id ? cap.image_id.slice(0, 8) + '…' : '—'}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '600', color: score > 0 ? 'var(--accent)' : score < 0 ? 'var(--red)' : 'var(--text-dimmer)' }}>{score > 0 ? '+' : ''}{score}</span></td>
                  <td><div style={{ display: 'flex', gap: '6px' }}><span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)' }}>↑{votes.up}</span><span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)' }}>↓{votes.down}</span></div></td>
                  <td style={{ color: 'var(--text-dimmer)' }}>{new Date(cap.created_at_utc).toLocaleDateString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
