import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_superadmin) redirect('/unauthorized')

  const displayName = profile?.username || user.email?.split('@')[0] || 'admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{ width: '220px', minWidth: '220px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: '600', color: 'var(--accent)' }}>crackd.</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '2px' }}>ADMIN CONSOLE</div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '▣' },
            { href: '/dashboard/users', label: 'Users', icon: '◎' },
            { href: '/dashboard/images', label: 'Images', icon: '◻' },
            { href: '/dashboard/captions', label: 'Captions', icon: '◈' },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '3px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '13px', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: '600', color: 'var(--accent)' }}>
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500' }}>{displayName}</div>
              <span className="badge badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>superadmin</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
    </div>
  )
}
