import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Captcha from '../components/Captcha'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [captchaOk, setCaptchaOk] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaOk) { setError('Please complete the captcha.'); return }
    setLoading(true)
    setError('')
    // Simulate slight async delay for UX
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.username, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Ambient glow */}
      <div style={styles.glow} />

      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={styles.brandName}>SecureOps</span>
        </div>

        <p style={styles.subtitle}>Information Assurance &amp; Network Security Platform</p>

        <div style={styles.divider} />

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Username */}
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter username"
                autoComplete="username"
                required
                style={styles.input}
                onFocus={e => e.target.parentElement.style.borderColor = 'var(--accent-mid)'}
                onBlur={e => e.target.parentElement.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                style={{ ...styles.input, paddingRight: '40px' }}
                onFocus={e => e.target.parentElement.style.borderColor = 'var(--accent-mid)'}
                onBlur={e => e.target.parentElement.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Captcha */}
          <Captcha onVerify={setCaptchaOk} />

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
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
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,255,170,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Authenticate
              </>
            )}
          </button>
        </form>

        <p style={styles.hint}>
          Demo: <code style={styles.code}>admin / Admin@1234</code>
        </p>
      </div>
    </div>
  )
}

const styles = {
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
  glow: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '300px',
    background: 'radial-gradient(ellipse, rgba(0,255,170,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    boxShadow: '0 0 0 1px rgba(0,255,170,0.04), 0 24px 64px rgba(0,0,0,0.6)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,255,170,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    marginBottom: '24px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text)',
    fontSize: '14px',
    padding: '11px 14px 11px 36px',
    width: '100%',
    borderRadius: '8px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
    lineHeight: 1,
    opacity: 0.6,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,77,109,0.08)',
    border: '1px solid rgba(255,77,109,0.25)',
    borderRadius: '8px',
    color: 'var(--danger)',
    fontSize: '13px',
    padding: '10px 14px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'var(--accent-dim)',
    border: '1px solid rgba(0,255,170,0.25)',
    borderRadius: '8px',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    padding: '12px',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(0,255,170,0.2)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  hint: {
    marginTop: '20px',
    fontSize: '11px',
    color: 'var(--text-dim)',
    textAlign: 'center',
  },
  code: {
    fontFamily: 'var(--mono)',
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
}
