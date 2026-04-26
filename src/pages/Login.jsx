import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Captcha from '../components/Captcha'

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  dur: Math.random() * 4 + 3,
  delay: Math.random() * 4,
}))

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [captchaOk, setCaptchaOk] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focusField, setFocusField] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaOk) { setError('Please complete the CAPTCHA verification.'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))
    const result = login(form.username, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      {/* Animated background grid */}
      <div style={s.grid} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%', background: 'var(--accent)',
          opacity: 0.15, pointerEvents: 'none',
          animation: `pulse ${p.dur}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}

      {/* Radial glow */}
      <div style={s.glowTop} />
      <div style={s.glowBottom} />

      {/* Scanline effect */}
      <div style={s.scanline} />

      <div style={{
        ...s.card,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Top accent bar */}
        <div style={s.topBar} />

        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logoRing}>
            <div style={s.logoInner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div>
            <div style={s.brandName}>SecureOps</div>
            <div style={s.brandSub}>v3.0 · NASTP CY103</div>
          </div>
        </div>

        {/* Status bar */}
        <div style={s.statusBar}>
          <span style={s.statusDot} />
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--mono)' }}>SYSTEM ONLINE</span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--mono)' }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div style={s.divider} />

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          {/* Username */}
          <div style={s.field}>
            <label style={s.label}>
              <span style={{ color: 'var(--accent)', marginRight: '6px' }}>01</span>
              Operator ID
            </label>
            <div style={{
              ...s.inputWrap,
              borderColor: focusField === 'user' ? 'var(--accent-mid)' : error ? 'rgba(255,61,107,0.3)' : 'var(--border)',
              boxShadow: focusField === 'user' ? '0 0 0 3px rgba(0,229,255,0.06)' : 'none',
            }}>
              <span style={s.inputIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter operator ID"
                autoComplete="username"
                required
                style={s.input}
                onFocus={() => setFocusField('user')}
                onBlur={() => setFocusField(null)}
              />
              {form.username && (
                <span style={{ position: 'absolute', right: '12px', color: 'var(--accent)', fontSize: '11px' }}>✓</span>
              )}
            </div>
          </div>

          {/* Password */}
          <div style={s.field}>
            <label style={s.label}>
              <span style={{ color: 'var(--accent)', marginRight: '6px' }}>02</span>
              Access Key
            </label>
            <div style={{
              ...s.inputWrap,
              borderColor: focusField === 'pass' ? 'var(--accent-mid)' : error ? 'rgba(255,61,107,0.3)' : 'var(--border)',
              boxShadow: focusField === 'pass' ? '0 0 0 3px rgba(0,229,255,0.06)' : 'none',
            }}>
              <span style={s.inputIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter access key"
                autoComplete="current-password"
                required
                style={{ ...s.input, paddingRight: '44px' }}
                onFocus={() => setFocusField('pass')}
                onBlur={() => setFocusField(null)}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={s.eyeBtn} tabIndex={-1}>
                {showPass
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Captcha */}
          <div style={s.field}>
            <label style={s.label}>
              <span style={{ color: 'var(--accent)', marginRight: '6px' }}>03</span>
              Human Verification
            </label>
            <Captcha onVerify={setCaptchaOk} />
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              <>
                <span style={s.spinner} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '0.1em' }}>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '0.1em' }}>AUTHENTICATE</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div style={s.hint}>
          <div style={s.hintRow}>
            <span style={{ color: 'var(--text-dim)' }}>admin</span>
            <span style={s.hintSep}>·</span>
            <code style={s.code}>Admin@1234</code>
            <span style={s.hintBadge}>FULL ACCESS</span>
          </div>
          <div style={s.hintRow}>
            <span style={{ color: 'var(--text-dim)' }}>analyst</span>
            <span style={s.hintSep}>·</span>
            <code style={s.code}>Analyst@1234</code>
            <span style={{ ...s.hintBadge, color: 'var(--info)', background: 'var(--info-dim)', borderColor: 'rgba(77,166,255,0.2)' }}>READ ONLY</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          <span>NASTP CY103 CCP · Information Assurance Platform</span>
          <span style={{ color: 'var(--accent)', opacity: 0.5 }}>■</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  grid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  scanline: {
    position: 'absolute', left: 0, right: 0, height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent)',
    animation: 'scanline 8s linear infinite',
    pointerEvents: 'none',
  },
  glowTop: {
    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
    width: '700px', height: '400px', pointerEvents: 'none',
    background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 65%)',
  },
  glowBottom: {
    position: 'absolute', bottom: '-100px', right: '10%',
    width: '400px', height: '300px', pointerEvents: 'none',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 65%)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    boxShadow: '0 0 0 1px rgba(0,229,255,0.05), 0 32px 80px rgba(0,0,0,0.7)',
    overflow: 'hidden',
  },
  topBar: {
    height: '3px',
    background: 'linear-gradient(90deg, var(--accent-2), var(--accent), var(--accent-3))',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '28px 32px 20px',
  },
  logoRing: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-bright)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 0 16px rgba(0,229,255,0.1)',
  },
  logoInner: {
    width: '36px', height: '36px', borderRadius: '8px',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,229,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandName: {
    fontSize: '22px', fontWeight: '700', color: 'var(--text)',
    letterSpacing: '-0.03em', lineHeight: 1.1,
  },
  brandSub: {
    fontSize: '10px', color: 'var(--text-dim)',
    fontFamily: 'var(--mono)', letterSpacing: '0.08em',
    marginTop: '3px',
  },
  statusBar: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 32px',
    background: 'var(--surface-2)',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent)',
    animation: 'pulse 2s infinite',
    flexShrink: 0,
  },
  divider: { height: '1px', background: 'var(--border)', margin: '0 32px' },
  form: {
    display: 'flex', flexDirection: 'column', gap: '20px',
    padding: '24px 32px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '10px', color: 'var(--text-muted)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center',
  },
  inputWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputIcon: {
    position: 'absolute', left: '13px', color: 'var(--text-dim)',
    display: 'flex', alignItems: 'center', pointerEvents: 'none',
  },
  input: {
    background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text)', fontSize: '14px',
    padding: '12px 14px 12px 38px', width: '100%', borderRadius: '8px',
  },
  eyeBtn: {
    position: 'absolute', right: '12px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-dim)', padding: '4px',
    display: 'flex', alignItems: 'center',
    transition: 'color 0.15s',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--danger-dim)',
    border: '1px solid rgba(255,61,107,0.2)',
    borderRadius: '8px', color: 'var(--danger)',
    fontSize: '12px', padding: '10px 14px',
    animation: 'fadeIn 0.2s ease',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12))',
    border: '1px solid rgba(0,229,255,0.25)',
    borderRadius: '8px', color: 'var(--accent)',
    cursor: 'pointer', padding: '13px',
    transition: 'all 0.2s', marginTop: '4px',
    position: 'relative', overflow: 'hidden',
  },
  spinner: {
    width: '15px', height: '15px',
    border: '2px solid rgba(0,229,255,0.15)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  hint: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    padding: '0 32px 24px',
  },
  hintRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 12px',
    background: 'var(--surface-2)',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    fontSize: '11px',
  },
  hintSep: { color: 'var(--text-dim)' },
  code: {
    fontFamily: 'var(--mono)', color: 'var(--text-muted)',
    fontSize: '11px', flex: 1,
  },
  hintBadge: {
    fontSize: '9px', color: 'var(--accent)',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: '4px', padding: '2px 6px',
    letterSpacing: '0.06em', fontFamily: 'var(--mono)',
  },
  bottomBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 32px',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface-2)',
    fontSize: '9px', color: 'var(--text-dim)',
    fontFamily: 'var(--mono)', letterSpacing: '0.06em',
  },
}
