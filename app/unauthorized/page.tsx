export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'var(--mono)' }}>
      <div style={{ fontSize: '11px', color: 'var(--red)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>ACCESS DENIED</div>
      <div style={{ fontSize: '48px', fontWeight: '600', color: 'var(--text-dimmer)' }}>403</div>
      <div style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '320px', textAlign: 'center', lineHeight: 1.7 }}>Your account does not have superadmin privileges.</div>
      <a href="/login" className="btn" style={{ marginTop: '8px' }}>← Back to Login</a>
    </div>
  )
}
