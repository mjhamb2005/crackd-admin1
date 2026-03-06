import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '28px 28px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>Read Only</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '26px', fontWeight: '800' }}>Users</h1>
        </div>
        <span className="badge badge-dim">{count?.toLocaleString()} total</span>
      </div>
      <table className="data-table">
        <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          {users?.map(user => (
            <tr key={user.id}>
              <td style={{ color: 'var(--text-dimmer)' }}>{user.id.slice(0, 8)}…</td>
              <td style={{ fontWeight: '600' }}>{user.username || user.display_name || user.name || '—'}</td>
              <td style={{ color: 'var(--text-dim)' }}>{user.email || '—'}</td>
              <td>{user.is_superadmin ? <span className="badge badge-purple">superadmin</span> : <span className="badge badge-dim">user</span>}</td>
              <td style={{ color: 'var(--text-dimmer)' }}>{user.created_datetime_utc ? new Date(user.created_datetime_utc).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
