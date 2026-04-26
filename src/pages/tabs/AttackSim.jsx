import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const ATTACKS = {
  dos: {
    name: 'DoS Simulation',
    icon: '⚡',
    color: '#ff3d6b',
    tag: 'AVAILABILITY',
    description: 'Simulates a Denial-of-Service SYN flood targeting a web server, exhausting connection resources.',
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
    color: '#ffb020',
    tag: 'INTEGRITY',
    description: 'Simulates ARP cache poisoning to intercept LAN traffic via a Man-in-the-Middle position.',
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
    color: '#4da6ff',
    tag: 'CONFIDENTIALITY',
    description: 'Simulates passive traffic capture on an unencrypted segment to demonstrate data exposure risks.',
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

function lineColor(line) {
  if (!line || typeof line !== 'string') return '#e2eaf4'
  if (line.startsWith('[CRIT]')) return '#ff3d6b'
  if (line.startsWith('[WARN]')) return '#ffb020'
  if (line.startsWith('[DFNS]')) return '#06ffa5'
  if (line.startsWith('[DONE]')) return '#06ffa5'
  if (line.startsWith('[EXPS]')) return '#ff3d6b'
  if (line.startsWith('[MITM]')) return '#ffb020'
  if (line.startsWith('[ATCK]')) return '#ff8c69'
  if (line.startsWith('[SNIF]')) return '#c084fc'
  if (line.startsWith('[PKT]'))  return '#94a3b8'
  if (line.startsWith('[INFO]')) return '#4d5a6b'
  if (line.startsWith('[SCAN]')) return '#4da6ff'
  if (line.startsWith('[INIT]')) return '#4da6ff'
  return '#e2eaf4'
}

const linePrefix = (line) => {
  if (!line || typeof line !== 'string') return null
  const m = line.match(/^\[([A-Z]+)\]/)
  return m ? m[1] : null
}

export default function AttackSim() {
  const { addAuditEntry } = useAuth()
  const [active, setActive] = useState(null)
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState([])
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
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
    setProgress(0)
    addAuditEntry('ATTACK_SIM', `Attack simulation started: ${ATTACKS[key].name}`, 'warning')

    const steps = ATTACKS[key].steps
    let i = 0
    const next = () => {
      if (i < steps.length) {
        setLines(prev => [...prev, steps[i]])
        setProgress(Math.round(((i + 1) / steps.length) * 100))
        i++
        timerRef.current = setTimeout(next, 260 + Math.random() * 180)
      } else {
        setRunning(false)
        setDone(true)
        setProgress(100)
        addAuditEntry('ATTACK_SIM_DONE', `Simulation complete: ${ATTACKS[key].name} — defense response logged`, 'info')
      }
    }
    next()
  }

  const reset = () => { setActive(null); setLines([]); setDone(false); setRunning(false); setProgress(0) }
  const atk = active ? ATTACKS[active] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease' }}>
      {/* Disclaimer */}
      <div style={{ background: 'rgba(255,176,32,0.06)', border: '1px solid rgba(255,176,32,0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>⚠</span>
        <p style={{ fontSize: '11px', color: 'var(--warning)', lineHeight: 1.7, fontFamily: 'var(--mono)' }}>
          EDUCATIONAL USE ONLY — All simulations are non-destructive. No real network traffic is generated. Demonstrates attack vectors and defense mechanisms for NASTP CY103 CCP.
        </p>
      </div>

      {/* Attack cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {Object.entries(ATTACKS).map(([key, a]) => (
          <button
            key={key}
            onClick={() => runSim(key)}
            disabled={running}
            style={{
              background: active === key
                ? `linear-gradient(135deg, ${a.color}10, ${a.color}06)`
                : 'var(--surface)',
              border: `1px solid ${active === key ? a.color + '60' : 'var(--border)'}`,
              borderRadius: '10px', padding: '18px',
              cursor: running ? 'not-allowed' : 'pointer',
              textAlign: 'left', transition: 'all 0.2s',
              opacity: running && active !== key ? 0.4 : 1,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {active === key && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: a.color, opacity: 0.8 }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>{a.icon}</span>
              <span style={{ fontSize: '9px', color: a.color, background: `${a.color}15`, border: `1px solid ${a.color}30`, borderRadius: '4px', padding: '2px 6px', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>{a.tag}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: active === key ? a.color : 'var(--text)', marginBottom: '6px' }}>{a.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>{a.description}</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {a.ciaImpact.c && <CIABadge label="C" color="#4da6ff" />}
              {a.ciaImpact.i && <CIABadge label="I" color="#06ffa5" />}
              {a.ciaImpact.a && <CIABadge label="A" color="#ffb020" />}
            </div>
          </button>
        ))}
      </div>

      {/* Terminal */}
      {active && (
        <div style={{ background: 'var(--surface)', border: `1px solid ${atk.color}40`, borderRadius: '10px', overflow: 'hidden', animation: 'fadeIn 0.25s ease' }}>
          {/* Terminal header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-2)', borderBottom: `1px solid ${atk.color}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Traffic lights */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.8 }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                secureops@sim:~$ <span style={{ color: atk.color }}>{atk.name.toLowerCase().replace(/ /g, '_')}.sh</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {running && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: atk.color, animation: 'pulse 0.8s infinite' }} />
                  <span style={{ fontSize: '10px', color: atk.color, fontFamily: 'var(--mono)' }}>RUNNING</span>
                </div>
              )}
              {done && <span style={{ fontSize: '10px', color: 'var(--success)', background: 'var(--success-dim)', padding: '2px 8px', borderRadius: '20px', fontFamily: 'var(--mono)' }}>✓ COMPLETE</span>}
              <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px', padding: '3px 10px', fontFamily: 'var(--mono)' }}>RESET</button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '2px', background: 'var(--border)' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: done ? 'var(--success)' : atk.color, transition: 'width 0.3s ease', boxShadow: `0 0 8px ${done ? 'var(--success)' : atk.color}` }} />
          </div>

          {/* Log output */}
          <div ref={logRef} style={{ fontFamily: 'var(--mono)', fontSize: '12px', padding: '16px', height: '300px', overflowY: 'auto', lineHeight: 2, background: '#050810' }}>
            {lines.map((line, i) => {
              const prefix = linePrefix(line)
              const rest = prefix ? line.slice(prefix.length + 2).trimStart() : line
              const color = lineColor(line)
              return (
                <div key={i} style={{ display: 'flex', gap: '10px', animation: 'slideIn 0.15s ease' }}>
                  {prefix && (
                    <span style={{ color, opacity: 0.7, minWidth: '44px', fontSize: '10px', paddingTop: '1px', letterSpacing: '0.04em' }}>[{prefix}]</span>
                  )}
                  <span style={{ color }}>{prefix ? rest : line}</span>
                </div>
              )
            })}
            {running && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: atk.color, opacity: 0.7, minWidth: '44px', fontSize: '10px' }}>[SYS]</span>
                <span style={{ color: atk.color, animation: 'blink 1s infinite' }}>█</span>
              </div>
            )}
          </div>

          {/* Defense summary */}
          {done && (
            <div style={{ padding: '16px', borderTop: `1px solid ${atk.color}25`, background: 'rgba(6,255,165,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>Defense Mechanism Applied</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7 }}>{atk.defense}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CIABadge({ label, color }) {
  const full = { C: 'Confidentiality', I: 'Integrity', A: 'Availability' }
  return (
    <span style={{ fontSize: '10px', color, background: `${color}12`, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${color}25`, fontFamily: 'var(--mono)' }}>
      {label} · {full[label]}
    </span>
  )
}
