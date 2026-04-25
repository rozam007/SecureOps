import { useState, useEffect, useRef } from 'react'

function generateCaptcha(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function Captcha({ onVerify }) {
  const [code, setCode] = useState(generateCaptcha)
  const [input, setInput] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    drawCaptcha(code)
  }, [code])

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, W, H)

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,255,170,${Math.random() * 0.15 + 0.05})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * W, Math.random() * H)
      ctx.lineTo(Math.random() * W, Math.random() * H)
      ctx.stroke()
    }

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(125,133,144,${Math.random() * 0.4})`
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Characters
    text.split('').forEach((char, i) => {
      const x = 18 + i * 28
      const y = H / 2 + 6
      const angle = (Math.random() - 0.5) * 0.4
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.font = `bold ${20 + Math.random() * 4}px JetBrains Mono, monospace`
      ctx.fillStyle = `hsl(${150 + Math.random() * 40}, 100%, ${60 + Math.random() * 20}%)`
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })
  }

  const refresh = () => {
    const newCode = generateCaptcha()
    setCode(newCode)
    setInput('')
    setVerified(false)
    setError(false)
    onVerify(false)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setInput(val)
    setError(false)
    if (val.length === code.length) {
      if (val === code) {
        setVerified(true)
        onVerify(true)
      } else {
        setError(true)
        onVerify(false)
        setTimeout(refresh, 800)
      }
    } else {
      setVerified(false)
      onVerify(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Captcha Verification
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <canvas
          ref={canvasRef}
          width={190}
          height={48}
          style={{
            borderRadius: '6px',
            border: '1px solid var(--border)',
            display: 'block',
          }}
        />
        <button
          type="button"
          onClick={refresh}
          title="Refresh captcha"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '16px',
            lineHeight: 1,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-mid)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          ↻
        </button>
      </div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Enter captcha"
        maxLength={code.length}
        autoComplete="off"
        style={{
          background: 'var(--surface-2)',
          border: `1px solid ${error ? 'var(--danger)' : verified ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '8px',
          color: error ? 'var(--danger)' : verified ? 'var(--accent)' : 'var(--text)',
          fontSize: '14px',
          fontFamily: 'var(--mono)',
          letterSpacing: '0.15em',
          outline: 'none',
          padding: '10px 14px',
          transition: 'border-color 0.2s, color 0.2s',
          width: '100%',
        }}
      />
      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '11px' }}>Incorrect captcha. Refreshing...</span>
      )}
      {verified && (
        <span style={{ color: 'var(--accent)', fontSize: '11px' }}>✓ Verified</span>
      )}
    </div>
  )
}
