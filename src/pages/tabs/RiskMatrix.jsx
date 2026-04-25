// Risk Matrix & CIA Triad Asset Analysis Tab

const ASSETS = [
  { name: 'User Authentication DB', type: 'Data', c: 5, i: 5, a: 4, threats: ['Brute Force', 'SQL Injection', 'Credential Stuffing'] },
  { name: 'Network Firewall', type: 'Infrastructure', c: 3, i: 5, a: 5, threats: ['Misconfiguration', 'DoS', 'Firmware Exploit'] },
  { name: 'Web Application Server', type: 'System', c: 4, i: 4, a: 5, threats: ['XSS', 'CSRF', 'DDoS'] },
  { name: 'Audit Log Storage', type: 'Data', c: 4, i: 5, a: 3, threats: ['Log Tampering', 'Unauthorized Access'] },
  { name: 'VPN Gateway', type: 'Infrastructure', c: 5, i: 4, a: 4, threats: ['MITM', 'ARP Spoofing', 'Packet Sniffing'] },
  { name: 'IDS/IPS Engine', type: 'Security', c: 3, i: 4, a: 5, threats: ['Evasion Techniques', 'Signature Bypass'] },
]

const RISKS = [
  { threat: 'Packet Sniffing', likelihood: 4, impact: 4, asset: 'VPN Gateway', control: 'TLS 1.3 Encryption', status: 'mitigated' },
  { threat: 'ARP Spoofing', likelihood: 3, impact: 5, asset: 'LAN Core Switch', control: 'Dynamic ARP Inspection', status: 'mitigated' },
  { threat: 'DoS / DDoS Attack', likelihood: 4, impact: 5, asset: 'Web App Server', control: 'Rate Limiting + IPS', status: 'partial' },
  { threat: 'Brute Force Login', likelihood: 5, impact: 4, asset: 'Auth Database', control: 'Account Lockout + MFA', status: 'mitigated' },
  { threat: 'SQL Injection', likelihood: 3, impact: 5, asset: 'Database Server', control: 'Parameterized Queries', status: 'mitigated' },
  { threat: 'Insider Threat', likelihood: 2, impact: 5, asset: 'Audit Logs', control: 'RBAC + Monitoring', status: 'partial' },
  { threat: 'Zero-Day Exploit', likelihood: 2, impact: 5, asset: 'All Systems', control: 'Patch Management', status: 'open' },
  { threat: 'Misconfiguration', likelihood: 4, impact: 3, asset: 'Firewall', control: 'Config Audits', status: 'partial' },
]

const riskScore = (l, i) => l * i
const riskLevel = (score) => {
  if (score >= 16) return { label: 'Critical', color: '#ff4d6d' }
  if (score >= 10) return { label: 'High', color: '#f0a500' }
  if (score >= 5) return { label: 'Medium', color: '#58a6ff' }
  return { label: 'Low', color: '#7d8590' }
}
const statusColor = { mitigated: '#00ffaa', partial: '#f0a500', open: '#ff4d6d' }

export default function RiskMatrix() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CIA Triad Asset Analysis */}
      <div style={panel}>
        <div style={panelHeader}>CIA Triad — Asset Analysis</div>
        <p style={desc}>Each asset is rated 1–5 for Confidentiality, Integrity, and Availability requirements per NIST SP 800-60.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                {['Asset', 'Type', 'Confidentiality', 'Integrity', 'Availability', 'Key Threats'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={td}>{a.name}</td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '11px' }}>{a.type}</td>
                  <td style={td}><CIABar val={a.c} color="#58a6ff" /></td>
                  <td style={td}><CIABar val={a.i} color="#00ffaa" /></td>
                  <td style={td}><CIABar val={a.a} color="#f0a500" /></td>
                  <td style={{ ...td, fontSize: '11px', color: 'var(--text-muted)' }}>{a.threats.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          {[['#58a6ff', 'Confidentiality'], ['#00ffaa', 'Integrity'], ['#f0a500', 'Availability']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Matrix */}
      <div style={panel}>
        <div style={panelHeader}>Risk Assessment Matrix</div>
        <p style={desc}>Likelihood × Impact scoring (1–5 scale). Risk scores mapped to NIST SP 800-30 risk levels.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                {['Threat', 'Asset', 'Likelihood', 'Impact', 'Risk Score', 'Level', 'Control', 'Status'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISKS.map(r => {
                const score = riskScore(r.likelihood, r.impact)
                const level = riskLevel(score)
                return (
                  <tr key={r.threat} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={td}>{r.threat}</td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-muted)' }}>{r.asset}</td>
                    <td style={{ ...td, textAlign: 'center' }}><ScoreDot val={r.likelihood} /></td>
                    <td style={{ ...td, textAlign: 'center' }}><ScoreDot val={r.impact} /></td>
                    <td style={{ ...td, textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 600, color: level.color }}>{score}</td>
                    <td style={td}><span style={{ color: level.color, fontSize: '11px', background: `${level.color}18`, padding: '2px 8px', borderRadius: '20px' }}>{level.label}</span></td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-muted)' }}>{r.control}</td>
                    <td style={td}><span style={{ color: statusColor[r.status], fontSize: '11px', textTransform: 'capitalize' }}>● {r.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Risk Heatmap */}
      <div style={panel}>
        <div style={panelHeader}>Risk Heatmap (Likelihood vs Impact)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '4px', maxWidth: '420px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>L\I</div>
          {[1,2,3,4,5].map(i => <div key={i} style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '4px' }}>{i}</div>)}
          {[5,4,3,2,1].map(l => (
            <>
              <div key={`l${l}`} style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>{l}</div>
              {[1,2,3,4,5].map(i => {
                const s = l * i
                const lv = riskLevel(s)
                const count = RISKS.filter(r => r.likelihood === l && r.impact === i).length
                return (
                  <div key={`${l}-${i}`} style={{
                    height: '44px', borderRadius: '4px', background: `${lv.color}22`,
                    border: `1px solid ${lv.color}44`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '11px', color: lv.color, fontFamily: 'var(--mono)',
                  }}>
                    {count > 0 ? count : ''}
                  </div>
                )
              })}
            </>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Numbers indicate count of threats at that risk coordinate.</p>
      </div>
    </div>
  )
}

function CIABar({ val, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', minWidth: '50px' }}>
        <div style={{ height: '100%', width: `${val * 20}%`, background: color, borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '11px', color, fontFamily: 'var(--mono)', minWidth: '12px' }}>{val}</span>
    </div>
  )
}

function ScoreDot({ val }) {
  const colors = ['', '#484f58', '#7d8590', '#58a6ff', '#f0a500', '#ff4d6d']
  return <span style={{ color: colors[val], fontFamily: 'var(--mono)', fontWeight: 600 }}>{val}</span>
}

const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }
const panelHeader = { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: '500' }
const desc = { fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.6 }
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const th = { textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: '500' }
const td = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'middle' }
