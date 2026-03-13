import { createClient } from '@/lib/supabase/server'

export default async function HumorFlavorStepsPage() {
  const supabase = await createClient()
  const { data, count } = await supabase.from('humor_flavor_steps').select('*', { count: 'exact' }).order('id')
  const cols = data && data[0] ? Object.keys(data[0]) : []
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Read Only</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Humor Flavor Steps</h1>
        </div>
        <span className="badge badge-dim">{count?.toLocaleString()} total</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr>{cols.map(k => <th key={k}>{k}</th>)}</tr></thead>
          <tbody>
            {data?.map((row, i) => (
              <tr key={i}>{cols.map((k, j) => (
                <td key={j} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row[k] === null ? <span style={{ color: 'var(--text-dimmer)' }}>null</span>
                    : typeof row[k] === 'boolean' ? <span className={`badge ${row[k] ? 'badge-green' : 'badge-dim'}`}>{String(row[k])}</span>
                    : String(row[k])}
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
        {(!data || data.length === 0) && <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dimmer)' }}>No records found.</div>}
      </div>
    </div>
  )
}