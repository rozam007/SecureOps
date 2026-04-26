// Risk Matrix & CIA Triad Asset Analysis Tab

const ASSETS = [
  { name: 'User Authentication DB', type: 'Data',           c: 5, i: 5, a: 4, threats: ['Brute Force', 'SQL Injection', 'Credential Stuffing'] },
  { name: 'Network Firewall',        type: 'Infrastructure', c: 3, i: 5, a: 5, threats: ['Misconfiguration', 'DoS', 'Firmware Exploit'] },
  { name: 'Web Application Server',  type: 'System',         c: 4, i: 4, a: 5, threats: ['XSS', 'CSRF', 'DDoS'] },
  { name: 'Audit Log Storage',       type: 'Data',           c: 4, i: 5, a: 3, threats: ['Log Tampering', 'Unauthorized Access'] },
  { name: 'VPN Gateway',             type: 'Infrastructure', c: 5, i: 4, a: 4, threats: ['MITM', 'ARP Spoofing', 'Packet Sniffing'] },
  { name: 'IDS/IPS Engine',          type: 'Security',       c: 3, i: 4, a: 5, threats: ['Evasion Techniques', 'Signature Bypass'] },
]

const RISKS = [
  { threat: 'Packet Sniffing',   likelihood: 4, impact: 4, asset: 'VPN Gateway',    control: 'TLS 1.3 Encryption',       status: 'mitigated' },
  { threat: 'ARP Spoofing',      likelihood: 3, impact: 5, asset: 'LAN Core Switch',control: 'Dynamic ARP Inspection',    status: 'mitigated' },
  { threat: 'DoS / DDoS Attack', likelihood: 4, impact: 5, asset: 'Web App Server', control: 'Rate Limiting + IPS',       status: 'partial' },
  { threat: 'Brute Force Login', likelihood: 5, impact: 4, asset: 'Auth Database',  control: 'Account Lockout + MFA',     status: 'mitigated' },
  { threat: 'SQL Injection',     likelihood: 3, impact: 5, asset: 'Database Server',control: 'Parameterized Queries',     status: 'mitigated' },
  { threat: 'Insider Threat',    likelihood: 2, impact: 5, asset: 'Audit Logs',     control: 'RBAC + Monitoring',         status: 'partial' },
  { threat: 'Zero-Day Exploit',  likelihood: 2, impact: 5, asset: 'All Systems',    control: 'Patch Management',          status: 'open' },
  { threat: 'Misconfiguration',  likelihood: 4, impact: 3, asset: 'Firewall',       control: 'Config Audits',             status: 'partial' },
]

const riskScore = (l, i) => l * i
const riskLevel = (score) => {
  if (score >= 16) return { label: 'Critical', color: '#ff3d6b' }
  if (score >= 10) return { label: 'High',     color: '#ffb020' }
  if (score >= 5)  return { label: 'Medium',   color: '#4da6ff' }
  return                   { label: 'Low',      color: '#3d4a5c' }
}
const STATUS_COLOR = { mitigated: '#06ffa5', partial: '#ffb020', open: '#ff3d6b' }

export default function RiskMatrix() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease' }}>
      {/* CIA Asset Analysis */}
      <div style={panel}>
        <div style={panelHeader}>CIA Triad — Asset Analysis</div>
        <p style={desc}>Each asset rated 1–5 for Confidentiality, Integrity, and Availability per NIST SP 800-60.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Asset', 'Type', 'Confidentiality', 'Integrity', 'Availability', 'Key Threats'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a, i) => (
                <tr key={a.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ ...td, fontWeight: 500 }}>{a.name}</td>
                  <td style={{ ...td, fontSize: '10px', fontFamily: 'var(--mono)' }}>
                    <span style={{ color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>{a.type}</span>
                  </td>
                  <td style={td}><CIABar val={a.c} color="#4da6ff" /></td>
                  <td style={td}><CIABar val={a.i} color="#06ffa5" /></td>
                  <td style={td}><CIABar val={a.a} color="#ffb020" /></td>
                  <td style={{ ...td, fontSize: '11px', color: 'var(--text-dim)' }}>{a.threats.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
          {[['#4da6ff', 'Confidentiality'], ['#06ffa5', 'Integrity'], ['#ffb020', 'Availability']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c, boxShadow: `0 0 6px ${c}` }} />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div style={panel}>
        <div style={panelHeader}>Risk Assessment Matrix</div>
        <p style={desc}>Likelihood × Impact scoring (1–5 scale). Risk scores mapped to NIST SP 800-30 risk levels.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Threat', 'Asset', 'Likelihood', 'Impact', 'Score', 'Level', 'Control', 'Status'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISKS.map((r, i) => {
                const score = riskScore(r.likelihood, r.impact)
                const level = riskLevel(score)
                return (
                  <tr key={r.threat} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ ...td, fontWeight: 500 }}>{r.threat}</td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-dim)' }}>{r.asset}</td>
                    <td style={{ ...td, textAlign: 'center' }}><ScoreDot val={r.likelihood} /></td>
                    <td style={{ ...td, textAlign: 'center' }}><ScoreDot val={r.impact} /></td>
                    <td style={{ ...td, textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 700, color: level.color, fontSize: '14px' }}>{score}</td>
                    <td style={td}>
                      <span style={{ color: level.color, fontSize: '10px', background: `${level.color}12`, border: `1px solid ${level.color}30`, padding: '3px 8px', borderRadius: '20px', fontFamily: 'var(--mono)' }}>{level.label}</span>
                    </td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-muted)' }}>{r.control}</td>
                    <td style={td}>
                      <span style={{ color: STATUS_COLOR[r.status], fontSize: '10px', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[r.status], boxShadow: `0 0 6px ${STATUS_COLOR[r.status]}`, display: 'inline-block' }} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap */}
      <div style={panel}>
        <div style={panelHeader}>Risk Heatmap — Likelihood vs Impact</div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 48px)', gap: '4px' }}>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px', fontFamily: 'var(--mono)' }}>L\I</div>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', paddingBottom: '4px', fontFamily: 'var(--mono)' }}>{i}</div>
              ))}
              {[5,4,3,2,1].map(l => [
                <div key={`l${l}`} style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', paddingRight: '4px', fontFamily: 'var(--mono)' }}>{l}</div>,
                ...[1,2,3,4,5].map(i => {
                  const s = l * i
                  const lv = riskLevel(s)
                  const count = RISKS.filter(r => r.likelihood === l && r.impact === i).length
                  return (
                    <div key={`${l}-${i}`} style={{
                      height: '48px', borderRadius: '6px',
                      background: `${lv.color}18`,
                      border: `1px solid ${lv.color}30`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: lv.color, fontFamily: 'var(--mono)',
                    }}>
                      <span style={{ fontSize: '9px', opacity: 0.5 }}>{s}</span>
                      {count > 0 && <span style={{ fontWeight: 700, fontSize: '13px' }}>{count}</span>}
                    </div>
                  )
                })
              ])}
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px', fontFamily: 'var(--mono)' }}>Numbers = threat count at coordinate. Small = risk score.</p>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '28px' }}>
            {[{ label: 'Critical', score: '≥16' }, { label: 'High', score: '10–15' }, { label: 'Medium', score: '5–9' }, { label: 'Low', score: '<5' }].map(l => {
              const lv = riskLevel(l.label === 'Critical' ? 20 : l.label === 'High' ? 12 : l.label === 'Medium' ? 6 : 2)
              return (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '20px', borderRadius: '4px', background: `${lv.color}18`, border: `1px solid ${lv.color}30` }} />
                  <span style={{ fontSize: '11px', color: lv.color, fontFamily: 'var(--mono)' }}>{l.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{l.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


function CIABar({ val, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ height: '100%', width: `${val * 20}%`, background: color, borderRadius: '3px', boxShadow: `0 0 6px ${color}` }} />
      </div>
      <span style={{ fontSize: '11px', color, fontFamily: 'var(--mono)', fontWeight: 600, minWidth: '12px' }}>{val}</span>
    </div>
  )
}

function ScoreDot({ val }) {
  const colors = ['', '#3d4a5c', '#4d5a6b', '#4da6ff', '#ffb020', '#ff3d6b']
  return (
    <span style={{ color: colors[val], fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px' }}>{val}</span>
  )
}

const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }
const panelHeader = { fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 600, fontFamily: 'var(--mono)' }
const desc = { fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.7 }
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const th = { textAlign: 'left', padding: '8px 12px', fontSize: '10px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }
const td = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'middle' }
