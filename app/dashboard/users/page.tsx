import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at_utc', { ascending: false })
    .limit(100)

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '4px' }}>Read Only</div>
          <h1 style={{ fontSize: '22px', fontWeight: '500' }}>Users / Profiles</h1>
        </div>
        <span className="badge badge-dim" style={{ fontSize: '11px' }}>{count?.toLocaleString()} total</span>
      </div>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span><span style={{ color: 'var(--amber)' }}>{users?.filter(u => u.is_superadmin).length ?? 0}</span> superadmins</span>
        <span><span style={{ color: 'var(--text)' }}>{users?.filter(u => !u.is_superadmin).length ?? 0}</span> regular users</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id}>
                <td style={{ color: 'var(--text-dimmer)' }}>{user.id.slice(0, 8)}…</td>
                <td style={{ fontWeight: '500' }}>{user.username || '—'}</td>
                <td style={{ color: 'var(--text-dim)' }}>{user.email || '—'}</td>
                <td>{user.is_superadmin ? <span className="badge badge-amber">superadmin</span> : <span className="badge badge-dim">user</span>}</td>
                <td style={{ color: 'var(--text-dimmer)' }}>{user.created_at_utc ? new Date(user.created_at_utc).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
