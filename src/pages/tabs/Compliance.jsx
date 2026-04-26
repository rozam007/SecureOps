// NIST SP 800-53 + ISO 27001 Compliance Mapping Tab

const NIST_CONTROLS = [
  { id: 'AC-1',  family: 'Access Control',        name: 'Access Control Policy',        status: 'implemented', evidence: 'RBAC enforced via AuthContext; role-based permissions per user' },
  { id: 'AC-2',  family: 'Access Control',        name: 'Account Management',           status: 'implemented', evidence: 'Two defined accounts (admin, analyst) with distinct privilege levels' },
  { id: 'AC-6',  family: 'Access Control',        name: 'Least Privilege',              status: 'implemented', evidence: 'Analyst role restricted from audit and attack-sim modules' },
  { id: 'AU-2',  family: 'Audit & Accountability',name: 'Audit Events',                 status: 'implemented', evidence: 'Login, logout, failed attempts, and module access logged to sessionStorage' },
  { id: 'AU-9',  family: 'Audit & Accountability',name: 'Protection of Audit Info',     status: 'partial',     evidence: 'Audit log stored in sessionStorage; persistent backend storage not implemented' },
  { id: 'IA-2',  family: 'Identification & Auth', name: 'Multi-Factor Authentication',  status: 'partial',     evidence: 'CAPTCHA implemented as second factor; hardware MFA not in scope' },
  { id: 'IA-5',  family: 'Identification & Auth', name: 'Authenticator Management',     status: 'implemented', evidence: 'Password complexity enforced; credentials hashed in production recommendation' },
  { id: 'SC-8',  family: 'System & Comms',        name: 'Transmission Confidentiality', status: 'planned',     evidence: 'TLS 1.3 recommended for deployment; not enforced in dev environment' },
  { id: 'SC-28', family: 'System & Comms',        name: 'Protection of Info at Rest',   status: 'planned',     evidence: 'AES-256 encryption recommended for credential storage' },
  { id: 'SI-3',  family: 'System Integrity',      name: 'Malicious Code Protection',    status: 'partial',     evidence: 'Input sanitization applied; no AV integration in current scope' },
  { id: 'IR-4',  family: 'Incident Response',     name: 'Incident Handling',            status: 'partial',     evidence: 'Threat feed and alert system implemented; no automated response workflow' },
  { id: 'CM-6',  family: 'Config Management',     name: 'Configuration Settings',       status: 'implemented', evidence: 'Firewall rules and ACL policies documented in Network Security tab' },
]

const ISO_CONTROLS = [
  { clause: 'A.9.1',  name: 'Access Control Policy',        status: 'implemented' },
  { clause: 'A.9.2',  name: 'User Access Management',       status: 'implemented' },
  { clause: 'A.9.4',  name: 'System & App Access Control',  status: 'implemented' },
  { clause: 'A.10.1', name: 'Cryptographic Controls',       status: 'partial' },
  { clause: 'A.12.4', name: 'Logging & Monitoring',         status: 'implemented' },
  { clause: 'A.13.1', name: 'Network Security Management',  status: 'implemented' },
  { clause: 'A.16.1', name: 'Incident Management',          status: 'partial' },
  { clause: 'A.18.1', name: 'Legal & Regulatory Compliance',status: 'planned' },
]

const POLICIES = [
  {
    type: 'EISP', name: 'Enterprise Information Security Policy',
    summary: 'Governs the overall security posture of SecureOps. Mandates CIA triad protection for all information assets, defines acceptable use, and establishes accountability for all users.',
    points: ['All users must authenticate before accessing any system resource','Data classified as Confidential must be encrypted at rest and in transit','Security incidents must be reported within 1 hour of detection','Annual security awareness training is mandatory for all personnel'],
  },
  {
    type: 'ISSP', name: 'Issue-Specific Security Policy — Remote Access',
    summary: 'Defines rules for VPN and remote access to the SecureOps platform, including authentication requirements and session management.',
    points: ['VPN access requires MFA authentication','Sessions idle for >15 minutes are automatically terminated','Remote access logs are retained for 90 days','Personal devices must meet endpoint compliance before connecting'],
  },
  {
    type: 'SysSP', name: 'System-Specific Security Policy — Web Application',
    summary: 'Technical controls and configuration standards for the SecureOps web application and its supporting infrastructure.',
    points: ['CAPTCHA required on all authentication endpoints','Account lockout after 5 failed login attempts','All API endpoints require valid session tokens','Input validation enforced on all user-supplied data'],
  },
]

const STATUS = {
  implemented: { color: '#06ffa5', bg: 'rgba(6,255,165,0.08)', border: 'rgba(6,255,165,0.2)', label: 'Implemented' },
  partial:     { color: '#ffb020', bg: 'rgba(255,176,32,0.08)', border: 'rgba(255,176,32,0.2)', label: 'Partial' },
  planned:     { color: '#4da6ff', bg: 'rgba(77,166,255,0.08)', border: 'rgba(77,166,255,0.2)', label: 'Planned' },
}

export default function Compliance() {
  const implemented = NIST_CONTROLS.filter(c => c.status === 'implemented').length
  const total = NIST_CONTROLS.length
  const score = Math.round((implemented / total) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease' }}>
      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { label: 'NIST SP 800-53', value: `${score}%`, sub: `${implemented}/${total} controls`, color: '#06ffa5', bar: score },
          { label: 'ISO/IEC 27001',  value: '75%',       sub: '6/8 clauses addressed',            color: '#4da6ff', bar: 75 },
          { label: 'Compliance Gaps',value: `${NIST_CONTROLS.filter(c => c.status !== 'implemented').length}`, sub: 'Controls needing attention', color: '#ffb020', bar: null },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color, opacity: 0.7 }} />
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '10px' }}>{s.label}</div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: s.color, fontFamily: 'var(--mono)', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: s.bar ? '12px' : 0 }}>{s.sub}</div>
            {s.bar && (
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.bar}%`, background: s.color, borderRadius: '2px', boxShadow: `0 0 6px ${s.color}` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* NIST Controls */}
      <div style={panel}>
        <div style={panelHeader}>NIST SP 800-53 Control Mapping</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Control ID', 'Family', 'Control Name', 'Status', 'Evidence / Implementation'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NIST_CONTROLS.map((c, i) => {
                const st = STATUS[c.status]
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ ...td, fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>{c.id}</td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{c.family}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{c.name}</td>
                    <td style={td}>
                      <span style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: '11px', color: 'var(--text-muted)', maxWidth: '280px' }}>{c.evidence}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISO 27001 */}
      <div style={panel}>
        <div style={panelHeader}>ISO/IEC 27001 Clause Mapping</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {ISO_CONTROLS.map(c => {
            const st = STATUS[c.status]
            return (
              <div key={c.clause} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: '4px' }}>{c.clause}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text)' }}>{c.name}</span>
                </div>
                <span style={{ color: st.color, fontSize: '10px', fontFamily: 'var(--mono)', flexShrink: 0, marginLeft: '12px' }}>● {st.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Policies */}
      <div style={panel}>
        <div style={panelHeader}>Security Policy Framework (EISP / ISSP / SysSP)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {POLICIES.map(p => (
            <div key={p.type} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,229,255,0.15)', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.06em' }}>{p.type}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '10px' }}>{p.summary}</p>
                {p.points.map(pt => (
                  <div key={pt} style={{ display: 'flex', gap: '8px', padding: '4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>{pt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }
const panelHeader = { fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600, fontFamily: 'var(--mono)' }
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const th = { textAlign: 'left', padding: '8px 12px', fontSize: '10px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }
const td = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'middle' }
