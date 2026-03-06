'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--red)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Access Denied</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '72px', fontWeight: '800', background: 'linear-gradient(135deg, #4a3d6a, #2a2040)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>403</div>
      <div style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '320px', textAlign: 'center', lineHeight: 1.7 }}>Your account does not have superadmin privileges. Contact a TA to get access.</div>
      <button onClick={handleSignOut} className="btn btn-primary" style={{ marginTop: '8px' }}>Sign Out & Try Again</button>
    </div>
  )
}
