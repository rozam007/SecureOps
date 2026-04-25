import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RiskMatrix from './tabs/RiskMatrix'
import Compliance from './tabs/Compliance'
import AttackSim from './tabs/AttackSim'
import AuditLog from './tabs/AuditLog'

const THREATS = [
  { id: 1, type: 'Intrusion Attempt', src: '192.168.4.21', severity: 'critical', time: '2m ago', status: 'blocked' },
  { id: 2, type: 'Port Scan Detected', src: '10.0.0.44', severity: 'high', time: '8m ago', status: 'monitoring' },
  { id: 3, type: 'Brute Force SSH', src: '203.0.113.5', severity: 'high', time: '15m ago', status: 'blocked' },
  { id: 4, type: 'Suspicious DNS Query', src: '172.16.0.9', severity: 'medium', time: '31m ago', status: 'flagged' },
  { id: 5, type: 'Unauthorized API Call', src: '10.0.1.102', severity: 'medium', time: '1h ago', status: 'resolved' },
  { id: 6, type: 'TLS Certificate Mismatch', src: '198.51.100.3', severity: 'low', time: '2h ago', status: 'resolved' },
]

const POLICIES = [
  { name: 'Zero Trust Network Access', compliance: 98 },
  { name: 'Data Loss Prevention', compliance: 94 },
  { name: 'Endpoint Detection & Response', compliance: 87 },
  { name: 'Multi-Factor Authentication', compliance: 100 },
  { name: 'Vulnerability Management', compliance: 72 },
]

const SEV_COLOR = { critical: '#ff4d6d', high: '#f0a500', medium: '#58a6ff', low: '#7d8590' }
const STS_COLOR = { blocked: '#00ffaa', monitoring: '#f0a500', flagged: '#58a6ff', resolved: '#484f58' }

// All nav tabs with required permission
const ALL_TABS = [
  { id: 'overview',    label: 'Overview',       icon: '⬡', permission: 'overview' },
  { id: 'threats',     label: 'Threat Intel',   icon: '◈', permission: 'threats' },
  { id: 'network',     label: 'Network Map',    icon: '◎', permission: 'network' },
  { id: 'risk',        label: 'Risk Matrix',    icon: '⊞', permission: 'risk-matrix' },
  { id: 'compliance',  label: 'IA Compliance',  icon: '◉', permission: 'compliance' },
  { id: 'attack',      label: 'Attack Sim',     icon: '⚡', permission: 'attack-sim' },
  { id: 'audit',       label: 'Audit Log',      icon: '≡', permission: 'audit' },
]

export default function Dashboard() {
  const { user, logout, hasPermission, addAuditEntry } = useAuth()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const visibleTabs = ALL_TABS.filter(t => hasPermission(t.permission))

  const handleTabChange = (id) => {
    setActiveTab(id)
    addAuditEntry('TAB_ACCESS', `User navigated to module: ${id}`, 'info')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabLabel = visibleTabs.find(t => t.id === activeTab)?.label || ''

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span style={s.logoText}>SecureOps</span>
          </div>

          {/* RBAC role badge */}
          <div style={s.roleBadge}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</span>
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>{user?.role}</span>
          </div>

          <nav style={s.nav}>
            {visibleTabs.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  ...s.navItem,
                  background: activeTab === item.id ? 'var(--accent-dim)' : 'transparent',
                  color: activeTab === item.id ? 'var(--accent)' : 'var(--text-muted)',
                  borderLeft: activeTab === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: '15px', lineHeight: 1 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={s.sideBottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{user?.username}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,109,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main style={s.main}>
        <header style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{tabLabel}</h1>
            <p style={s.pageSubtitle}>
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{time.toLocaleTimeString()}</span>
            </p>
          </div>
          <div style={s.statusBadge}>
            <span style={s.statusDot} />
            Systems Nominal
          </div>
        </header>

        <div style={s.content}>
          {activeTab === 'overview'   && <OverviewTab />}
          {activeTab === 'threats'    && <ThreatsTab />}
          {activeTab === 'network'    && <NetworkTab />}
          {activeTab === 'risk'       && <RiskMatrix />}
          {activeTab === 'compliance' && <Compliance />}
          {activeTab === 'attack'     && <AttackSim />}
          {activeTab === 'audit'      && <AuditLog />}
        </div>
      </main>
    </div>
  )
}

function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={s.statsGrid}>
        <StatCard label="Threats Blocked" value="1,284" sub="↑ 12% this week" color="var(--accent)" icon="🛡" />
        <StatCard label="Active Alerts" value="7" sub="3 critical" color="#ff4d6d" icon="⚠" />
        <StatCard label="Network Nodes" value="342" sub="All reachable" color="#58a6ff" icon="◎" />
        <StatCard label="NIST Compliance" value="83%" sub="SP 800-53 mapped" color="#f0a500" icon="✦" />
      </div>
      <div style={s.twoCol}>
        <div style={s.panel}>
          <div style={s.panelHeader}>Recent Threat Activity</div>
          {THREATS.slice(0, 4).map(t => <ThreatRow key={t.id} threat={t} />)}
        </div>
        <div style={s.panel}>
          <div style={s.panelHeader}>IA Compliance Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {POLICIES.map(p => <PolicyBar key={p.name} policy={p} />)}
          </div>
        </div>
      </div>
      {/* CIA Summary */}
      <div style={s.panel}>
        <div style={s.panelHeader}>CIA Triad — System Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Confidentiality', score: 92, color: '#58a6ff', desc: 'AES-256 encryption, RBAC, TLS 1.3 enforced' },
            { label: 'Integrity', score: 96, color: '#00ffaa', desc: 'SHA-256 file hashing, immutable audit logs' },
            { label: 'Availability', score: 87, color: '#f0a500', desc: '99.7% uptime, IPS rate limiting active' },
          ].map(c => (
            <div key={c.label} style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{c.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: c.color, fontFamily: 'var(--mono)', marginBottom: '6px' }}>{c.score}%</div>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${c.score}%`, background: c.color, borderRadius: '2px' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ThreatsTab() {
  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>Threat Intelligence Feed</div>
      {THREATS.map(t => <ThreatRow key={t.id} threat={t} full />)}
    </div>
  )
}

function NetworkTab() {
  const nodes = [
    { id: 'FW',   label: 'Firewall',     x: 50,  y: 50,  color: 'var(--accent)' },
    { id: 'IDS',  label: 'IDS/IPS',      x: 200, y: 50,  color: '#58a6ff' },
    { id: 'DMZ',  label: 'DMZ',          x: 350, y: 50,  color: '#f0a500' },
    { id: 'LAN',  label: 'LAN Core',     x: 50,  y: 180, color: 'var(--accent)' },
    { id: 'SIEM', label: 'SIEM',         x: 200, y: 180, color: '#58a6ff' },
    { id: 'WEB',  label: 'Web Servers',  x: 350, y: 180, color: '#7d8590' },
    { id: 'DB',   label: 'Database',     x: 125, y: 300, color: '#ff4d6d' },
    { id: 'VPN',  label: 'VPN Gateway',  x: 275, y: 300, color: 'var(--accent)' },
  ]
  const edges = [['FW','IDS'],['IDS','DMZ'],['FW','LAN'],['LAN','SIEM'],['SIEM','IDS'],['DMZ','WEB'],['LAN','DB'],['WEB','DB'],['FW','VPN'],['VPN','LAN']]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={s.panel}>
        <div style={s.panelHeader}>Network Topology</div>
        <svg width="100%" viewBox="0 0 450 380" style={{ display: 'block', maxHeight: '380px' }}>
          <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          {edges.map(([a, b]) => {
            const na = nodes.find(n => n.id === a), nb = nodes.find(n => n.id === b)
            return <line key={a+b} x1={na.x+40} y1={na.y+20} x2={nb.x+40} y2={nb.y+20} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3" />
          })}
          {nodes.map(n => (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width="80" height="40" rx="6" fill="var(--surface-2)" stroke={n.color} strokeWidth="1" filter="url(#glow)" opacity="0.9" />
              <text x={n.x+40} y={n.y+15} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="var(--mono)" fontWeight="600">{n.id}</text>
              <text x={n.x+40} y={n.y+28} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font)">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {/* Firewall Rules */}
      <div style={s.panel}>
        <div style={s.panelHeader}>Firewall ACL Rules</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead><tr>{['Rule','Direction','Source','Destination','Port','Action'].map(h => <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:'11px', color:'var(--text-muted)', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['ACL-01','INBOUND','ANY','192.168.1.10','443','ALLOW'],
              ['ACL-02','INBOUND','ANY','192.168.1.10','80','REDIRECT→443'],
              ['ACL-03','INBOUND','ANY','192.168.1.10','22','DENY'],
              ['ACL-04','INBOUND','10.0.0.0/8','192.168.1.1','ANY','ALLOW'],
              ['ACL-05','OUTBOUND','192.168.1.0/24','ANY','ANY','ALLOW'],
              ['ACL-06','INBOUND','ANY','ANY','23,21','DENY'],
            ].map(([rule,...cols]) => (
              <tr key={rule} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:'11px', color:'var(--accent)' }}>{rule}</td>
                {cols.map((c,i) => <td key={i} style={{ padding:'9px 12px', color: c==='DENY'?'#ff4d6d':c.startsWith('ALLOW')||c.startsWith('REDIRECT')?'#00ffaa':'var(--text-muted)', fontFamily:'var(--mono)', fontSize:'12px' }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
          <div style={{ fontSize: '32px', fontWeight: 600, color, fontFamily: 'var(--mono)', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
        </div>
        <div style={{ fontSize: '22px', opacity: 0.5 }}>{icon}</div>
      </div>
    </div>
  )
}

function ThreatRow({ threat, full }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: SEV_COLOR[threat.severity], flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{threat.type}</div>
          {full && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{threat.src}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: SEV_COLOR[threat.severity], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{threat.severity}</span>
        <span style={{ fontSize: '10px', color: STS_COLOR[threat.status], background: `${STS_COLOR[threat.status]}18`, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{threat.status}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{threat.time}</span>
      </div>
    </div>
  )
}

function PolicyBar({ policy }) {
  const color = policy.compliance >= 90 ? 'var(--accent)' : policy.compliance >= 75 ? '#f0a500' : '#ff4d6d'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text)' }}>{policy.name}</span>
        <span style={{ fontSize: '12px', color, fontFamily: 'var(--mono)' }}>{policy.compliance}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${policy.compliance}%`, background: color, borderRadius: '2px' }} />
      </div>
    </div>
  )
}

const s = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' },
  sidebar: { width: '220px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0' },
  sideTop: { display: 'flex', flexDirection: 'column', gap: '16px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px' },
  logoIcon: { width: '32px', height: '32px', background: 'var(--accent-dim)', border: '1px solid rgba(0,255,170,0.2)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '16px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.02em' },
  roleBadge: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 20px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', textAlign: 'left', transition: 'all 0.15s', width: '100%' },
  sideBottom: { padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(0,255,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--accent)', flexShrink: 0 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', color: '#ff4d6d', cursor: 'pointer', fontSize: '13px', transition: 'background 0.15s', width: '100%' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  pageTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.02em' },
  pageSubtitle: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(0,255,170,0.2)', borderRadius: '20px', padding: '5px 12px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)', animation: 'pulse 2s infinite' },
  content: { flex: 1, overflow: 'auto', padding: '24px 28px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' },
  panelHeader: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', fontWeight: '500' },
}
