import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

const NAV = [
  { group: 'Overview', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  ]},
  { group: 'Users & Access', items: [
    { href: '/dashboard/users', label: 'Users', icon: '◎' },
    { href: '/dashboard/allowed-domains', label: 'Allowed Domains', icon: '◉' },
    { href: '/dashboard/whitelisted-emails', label: 'Whitelisted Emails', icon: '◈' },
  ]},
  { group: 'Content', items: [
    { href: '/dashboard/images', label: 'Images', icon: '◻' },
    { href: '/dashboard/captions', label: 'Captions', icon: '▷' },
    { href: '/dashboard/caption-requests', label: 'Caption Requests', icon: '◁' },
    { href: '/dashboard/caption-examples', label: 'Caption Examples', icon: '▸' },
    { href: '/dashboard/terms', label: 'Terms', icon: '≡' },
  ]},
  { group: 'Humor', items: [
    { href: '/dashboard/humor-flavors', label: 'Humor Flavors', icon: '◆' },
    { href: '/dashboard/humor-flavor-steps', label: 'Flavor Steps', icon: '◇' },
    { href: '/dashboard/humor-mix', label: 'Humor Mix', icon: '◈' },
  ]},
  { group: 'AI / LLM', items: [
    { href: '/dashboard/llm-providers', label: 'LLM Providers', icon: '⬡' },
    { href: '/dashboard/llm-models', label: 'LLM Models', icon: '⬢' },
    { href: '/dashboard/llm-prompt-chains', label: 'Prompt Chains', icon: '⟳' },
    { href: '/dashboard/llm-responses', label: 'LLM Responses', icon: '⟵' },
  ]},
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_superadmin) redirect('/unauthorized')

  const displayName = profile?.username || user.email?.split('@')[0] || 'admin'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{ width: '220px', minWidth: '220px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: '600', color: 'var(--accent)' }}>crackd.</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '2px' }}>ADMIN CONSOLE</div>
        </div>
        <nav style={{ padding: '8px', flex: 1 }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: '4px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dimmer)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>{group}</div>
              {items.map(({ href, label, icon }) => (
                <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '3px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', marginBottom: '1px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', width: '14px', textAlign: 'center' }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
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