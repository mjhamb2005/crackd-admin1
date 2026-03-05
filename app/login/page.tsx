'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>INTERNAL TOOL</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '42px', fontWeight: '600', color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>crackd.</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)', letterSpacing: '0.2em', marginTop: '6px' }}>ADMIN CONSOLE</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', padding: '32px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Restricted Access</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', lineHeight: 1.6 }}>Superadmin credentials required.</div>
          </div>
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px' }} onClick={handleGoogleLogin} disabled={loading}>
            {loading ? 'authenticating...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
