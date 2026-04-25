import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const ATTACKS = {
  dos: {
    name: 'DoS Simulation',
    icon: '⚡',
    color: '#ff4d6d',
    description: 'Simulates a Denial-of-Service flood attack targeting the web server. Demonstrates how high-volume requests exhaust server resources.',
    steps: [
      '[INIT] Target: 192.168.1.10:80 (Web Application Server)',
      '[SCAN] Checking target availability... ONLINE',
      '[ATCK] Sending SYN flood packets — 1,000 req/s',
      '[ATCK] Packets sent: 1,240 | Dropped: 0 | Latency: 12ms',
      '[ATCK] Packets sent: 4,890 | Dropped: 0 | Latency: 48ms',
      '[ATCK] Packets sent: 9,100 | Dropped: 312 | Latency: 210ms',
      '[WARN] Server response degrading — latency spike detected',
      '[ATCK] Packets sent: 15,000 | Dropped: 2,100 | Latency: 890ms',
      '[CRIT] Server unresponsive — DoS condition achieved',
      '[DFNS] IPS rule triggered: Rate limit enforced (>500 req/s blocked)',
      '[DFNS] Firewall ACL updated: Source IP 10.0.0.99 blacklisted',
      '[DFNS] Alert generated: INCIDENT-2026-0042 — DoS Attack Detected',
      '[DONE] Simulation complete. Defense response: SUCCESSFUL',
    ],
    defense: 'Rate limiting, SYN cookies, IPS threshold rules, and IP blacklisting mitigated the attack.',
    ciaImpact: { c: false, i: false, a: true },
  },
  arp: {
    name: 'ARP Spoofing',
    icon: '🔀',
    color: '#f0a500',
    description: 'Simulates an ARP cache poisoning attack to intercept traffic between two hosts on the LAN via a Man-in-the-Middle position.',
    steps: [
      '[INIT] Attacker: 192.168.1.99 | Victim: 192.168.1.5 | Gateway: 192.168.1.1',
      '[SCAN] ARP table of victim before attack:',
      '[INFO]   192.168.1.1 → AA:BB:CC:DD:EE:01 (legitimate gateway MAC)',
      '[ATCK] Sending gratuitous ARP replies to victim...',
      '[ATCK] ARP Reply: "192.168.1.1 is at 00:11:22:33:44:55" (attacker MAC)',
      '[ATCK] ARP table of victim POISONED:',
      '[INFO]   192.168.1.1 → 00:11:22:33:44:55 (attacker MAC — SPOOFED)',
      '[MITM] Traffic from victim now routed through attacker',
      '[SNIF] Captured packet: HTTP GET /login — credentials visible in plaintext',
      '[DFNS] Dynamic ARP Inspection (DAI) triggered on switch port',
      '[DFNS] Invalid ARP reply dropped — ARP table restored',
      '[DFNS] Alert: ARP_SPOOF_DETECTED on VLAN 10, Port Gi0/1',
      '[DONE] Simulation complete. Defense response: SUCCESSFUL',
    ],
    defense: 'Dynamic ARP Inspection (DAI), static ARP entries for critical hosts, and VLAN segmentation prevent ARP spoofing.',
    ciaImpact: { c: true, i: true, a: false },
  },
  sniff: {
    name: 'Packet Sniffing',
    icon: '👁',
    color: '#58a6ff',
    description: 'Simulates passive network traffic capture on an unencrypted segment to demonstrate data exposure risks.',
    steps: [
      '[INIT] Interface: eth0 | Mode: Promiscuous | Filter: port 80',
      '[SNIF] Capturing packets on 192.168.1.0/24...',
      '[PKT]  Frame 1: 192.168.1.5 → 192.168.1.10 | HTTP GET /dashboard',
      '[PKT]  Frame 2: 192.168.1.5 → 192.168.1.10 | HTTP POST /login',
      '[EXPS] POST body decoded: username=admin&password=Admin@1234',
      '[CRIT] Credentials exposed in plaintext — CONFIDENTIALITY BREACH',
      '[PKT]  Frame 3: 192.168.1.10 → 192.168.1.5 | HTTP 200 OK + session cookie',
      '[EXPS] Session token captured: sess_id=a3f9b2c1d4e5...',
      '[CRIT] Session hijacking possible with captured token',
      '[DFNS] Countermeasure: Enforce HTTPS (TLS 1.3) on all endpoints',
      '[DFNS] Countermeasure: HSTS header deployed — HTTP redirected to HTTPS',
      '[DFNS] Countermeasure: Secure + HttpOnly flags set on session cookies',
      '[DONE] Simulation complete. Encryption eliminates sniffing risk.',
    ],
    defense: 'TLS 1.3 encryption, HSTS enforcement, and secure cookie flags prevent packet sniffing from exposing sensitive data.',
    ciaImpact: { c: true, i: false, a: false },
  },
}

export default function AttackSim() {
  const { addAuditEntry } = useAuth()
  const [active, setActive] = useState(null)
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState([])
  const [done, setDone] = useState(false)
  const logRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const runSim = (key) => {
    if (running) return
    setActive(key)
    setLines([])
    setDone(false)
    setRunning(true)
    addAuditEntry('ATTACK_SIM', `Attack simulation started: ${ATTACKS[key].name}`, 'warning')

    const steps = ATTACKS[key].steps
    let i = 0
    const next = () => {
      if (i < steps.length) {
        setLines(prev => [...prev, steps[i]])
        i++
        timerRef.current = setTimeout(next, 280 + Math.random() * 200)
      } else {
        setRunning(false)
        setDone(true)
        addAuditEntry('ATTACK_SIM_DONE', `Simulation complete: ${ATTACKS[key].name} — defense response logged`, 'info')
      }
    }
    next()
  }

  const reset = () => { setActive(null); setLines([]); setDone(false); setRunning(false) }

  const atk = active ? ATTACKS[active] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Disclaimer */}
      <div style={{ background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠</span>
        <p style={{ fontSize: '12px', color: '#f0a500', lineHeight: 1.6 }}>
          All simulations are educational and non-destructive. No real network traffic is generated. This module demonstrates attack vectors and corresponding defense mechanisms for academic purposes only (NASTP CY103 CCP).
        </p>
      </div>

      {/* Attack selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {Object.entries(ATTACKS).map(([key, a]) => (
          <button
            key={key}
            onClick={() => runSim(key)}
            disabled={running}
            style={{
              background: active === key ? `${a.color}12` : 'var(--surface)',
              border: `1px solid ${active === key ? a.color : 'var(--border)'}`,
              borderRadius: '10px', padding: '18px', cursor: running ? 'not-allowed' : 'pointer',
              textAlign: 'left', transition: 'all 0.2s', opacity: running && active !== key ? 0.5 : 1,
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{a.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: active === key ? a.color : 'var(--text)', marginBottom: '6px' }}>{a.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.description}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {a.ciaImpact.c && <span style={badge('#58a6ff')}>Confidentiality</span>}
              {a.ciaImpact.i && <span style={badge('#00ffaa')}>Integrity</span>}
              {a.ciaImpact.a && <span style={badge('#f0a500')}>Availability</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Terminal output */}
      {active && (
        <div style={{ background: 'var(--surface)', border: `1px solid ${atk.color}44`, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${atk.color}33`, background: `${atk.color}08` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>{atk.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: atk.color }}>{atk.name} — Live Output</span>
              {running && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: atk.color, animation: 'pulse 1s infinite', display: 'inline-block' }} />}
              {done && <span style={{ fontSize: '11px', color: '#00ffaa', background: 'rgba(0,255,170,0.1)', padding: '2px 8px', borderRadius: '20px' }}>✓ Complete</span>}
            </div>
            <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '4px 10px' }}>Reset</button>
          </div>
          <div ref={logRef} style={{ fontFamily: 'var(--mono)', fontSize: '12px', padding: '16px', height: '280px', overflowY: 'auto', lineHeight: 1.8 }}>
            {lines.map((line, i) => (
              <div key={i} style={{ color: lineColor(line) }}>{line}</div>
            ))}
            {running && <span style={{ color: atk.color, animation: 'pulse 0.8s infinite' }}>█</span>}
          </div>
          {done && (
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${atk.color}33`, background: 'rgba(0,255,170,0.04)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Defense Mechanism Applied</div>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{atk.defense}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function lineColor(line) {
  if (line.startsWith('[CRIT]')) return '#ff4d6d'
  if (line.startsWith('[WARN]')) return '#f0a500'
  if (line.startsWith('[DFNS]')) return '#00ffaa'
  if (line.startsWith('[DONE]')) return '#00ffaa'
  if (line.startsWith('[EXPS]')) return '#ff4d6d'
  if (line.startsWith('[MITM]')) return '#f0a500'
  if (line.startsWith('[ATCK]')) return '#ff8c69'
  if (line.startsWith('[INFO]')) return '#7d8590'
  return '#e6edf3'
}

const badge = (color) => ({
  fontSize: '10px', color, background: `${color}18`, padding: '2px 6px',
  borderRadius: '4px', border: `1px solid ${color}33`,
})
