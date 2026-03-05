'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={handleSignOut} className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '5px 10px' }}>
      Sign Out
    </button>
  )
}
