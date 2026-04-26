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

const SEV_COLOR = { critical: '#ff3d6b', high: '#ffb020', medium: '#4da6ff', low: '#3d4a5c' }
const STS_COLOR = { blocked: '#06ffa5', monitoring: '#ffb020', flagged: '#4da6ff', resolved: '#3d4a5c' }

const ALL_TABS = [
  { id: 'overview',   label: 'Overview',      icon: '⬡', permission: 'overview' },
  { id: 'threats',    label: 'Threat Intel',  icon: '◈', permission: 'threats' },
  { id: 'network',    label: 'Network Map',   icon: '◎', permission: 'network' },
  { id: 'risk',       label: 'Risk Matrix',   icon: '⊞', permission: 'risk-matrix' },
  { id: 'compliance', label: 'IA Compliance', icon: '◉', permission: 'compliance' },
  { id: 'attack',     label: 'Attack Sim',    icon: '⚡', permission: 'attack-sim' },
  { id: 'audit',      label: 'Audit Log',     icon: '≡', permission: 'audit' },
]

export default function Dashboard() {
  const { user, logout, hasPermission, addAuditEntry } = useAuth()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const visibleTabs = ALL_TABS.filter(t => hasPermission(t.permission))

  const handleTabChange = (id) => {
    setActiveTab(id)
    addAuditEntry('TAB_ACCESS', `User navigated to module: ${id}`, 'info')
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const tabLabel = visibleTabs.find(t => t.id === activeTab)?.label || ''
  const tabIcon = visibleTabs.find(t => t.id === activeTab)?.icon || ''

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: sidebarCollapsed ? '64px' : '230px' }}>
        <div style={s.sideTop}>
          {/* Logo */}
          <div style={s.logoArea}>
            <div style={s.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            {!sidebarCollapsed && <span style={s.logoText}>SecureOps</span>}
            <button onClick={() => setSidebarCollapsed(v => !v)} style={s.collapseBtn} title="Toggle sidebar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {sidebarCollapsed
                  ? <><polyline points="9 18 15 12 9 6"/></>
                  : <><polyline points="15 18 9 12 15 6"/></>
                }
              </svg>
            </button>
          </div>

          {/* Role badge */}
          {!sidebarCollapsed && (
            <div style={s.roleBadge}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>Clearance Level</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>{user?.role}</span>
            </div>
          )}

          {/* Nav */}
          <nav style={s.nav}>
            {visibleTabs.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  ...s.navItem,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  background: activeTab === item.id
                    ? 'linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,229,255,0.04))'
                    : 'transparent',
                  color: activeTab === item.id ? 'var(--accent)' : 'var(--text-muted)',
                  borderLeft: activeTab === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                  boxShadow: activeTab === item.id ? 'inset 0 0 20px rgba(0,229,255,0.03)' : 'none',
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && <span style={{ fontSize: '13px' }}>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div style={s.sideBottom}>
          {!sidebarCollapsed && (
            <div style={s.userCard}>
              <div style={s.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ ...s.logoutBtn, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,61,107,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Topbar */}
        <header style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', opacity: 0.6 }}>{tabIcon}</span>
            <div>
              <h1 style={s.pageTitle}>{tabLabel}</h1>
              <p style={s.pageSubtitle}>
                {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' · '}
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{time.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={s.topbarBadge}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>NOMINAL</span>
            </div>
            <div style={{ ...s.topbarBadge, color: '#ff3d6b', background: 'var(--danger-dim)', borderColor: 'rgba(255,61,107,0.2)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>3 ALERTS</span>
            </div>
          </div>
        </header>

        {/* Content */}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <StatCard label="Threats Blocked" value="1,284" delta="+12%" color="var(--accent)" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        } />
        <StatCard label="Active Alerts" value="7" delta="3 critical" color="var(--danger)" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        } />
        <StatCard label="Network Nodes" value="342" delta="All reachable" color="var(--info)" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        } />
        <StatCard label="NIST Compliance" value="83%" delta="SP 800-53" color="var(--warning)" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        } />
      </div>

      {/* CIA Triad */}
      <div style={panel}>
        <div style={panelHeader}>CIA Triad — System Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Confidentiality', score: 92, color: 'var(--info)', desc: 'AES-256 · RBAC · TLS 1.3' },
            { label: 'Integrity', score: 96, color: 'var(--accent)', desc: 'SHA-256 · Immutable Logs' },
            { label: 'Availability', score: 87, color: 'var(--warning)', desc: '99.7% Uptime · IPS Active' },
          ].map(c => (
            <div key={c.label} style={{ padding: '18px', background: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: c.color, opacity: 0.6 }} />
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '10px' }}>{c.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: c.color, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '10px' }}>{c.score}<span style={{ fontSize: '16px' }}>%</span></div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.score}%`, background: c.color, borderRadius: '2px', boxShadow: `0 0 8px ${c.color}` }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={panel}>
          <div style={panelHeader}>Recent Threat Activity</div>
          {THREATS.slice(0, 5).map(t => <ThreatRow key={t.id} threat={t} />)}
        </div>
        <div style={panel}>
          <div style={panelHeader}>IA Compliance Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {POLICIES.map(p => <PolicyBar key={p.name} policy={p} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThreatsTab() {
  return (
    <div style={{ ...panel, animation: 'fadeIn 0.3s ease' }}>
      <div style={panelHeader}>Threat Intelligence Feed</div>
      {THREATS.map(t => <ThreatRow key={t.id} threat={t} full />)}
    </div>
  )
}

function NetworkTab() {
  const nodes = [
    { id: 'FW',   label: 'Firewall',    x: 50,  y: 50,  color: 'var(--accent)' },
    { id: 'IDS',  label: 'IDS/IPS',     x: 200, y: 50,  color: 'var(--info)' },
    { id: 'DMZ',  label: 'DMZ',         x: 350, y: 50,  color: 'var(--warning)' },
    { id: 'LAN',  label: 'LAN Core',    x: 50,  y: 180, color: 'var(--accent)' },
    { id: 'SIEM', label: 'SIEM',        x: 200, y: 180, color: 'var(--info)' },
    { id: 'WEB',  label: 'Web Servers', x: 350, y: 180, color: 'var(--text-muted)' },
    { id: 'DB',   label: 'Database',    x: 125, y: 300, color: 'var(--danger)' },
    { id: 'VPN',  label: 'VPN Gateway', x: 275, y: 300, color: 'var(--accent)' },
  ]
  const edges = [['FW','IDS'],['IDS','DMZ'],['FW','LAN'],['LAN','SIEM'],['SIEM','IDS'],['DMZ','WEB'],['LAN','DB'],['WEB','DB'],['FW','VPN'],['VPN','LAN']]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
      <div style={panel}>
        <div style={panelHeader}>Network Topology</div>
        <svg width="100%" viewBox="0 0 450 380" style={{ display: 'block', maxHeight: '380px' }}>
          <defs>
            <filter id="glow2"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {edges.map(([a, b]) => {
            const na = nodes.find(n => n.id === a), nb = nodes.find(n => n.id === b)
            return <line key={a+b} x1={na.x+40} y1={na.y+20} x2={nb.x+40} y2={nb.y+20} stroke="rgba(0,229,255,0.12)" strokeWidth="1.5" strokeDasharray="5 4" />
          })}
          {nodes.map(n => (
            <g key={n.id} filter="url(#glow2)">
              <rect x={n.x} y={n.y} width="80" height="40" rx="7" fill="var(--surface-3)" stroke={n.color} strokeWidth="1" opacity="0.95" />
              <text x={n.x+40} y={n.y+15} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="var(--mono)" fontWeight="700">{n.id}</text>
              <text x={n.x+40} y={n.y+28} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font)">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div style={panel}>
        <div style={panelHeader}>Firewall ACL Rules</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead><tr>{['Rule','Direction','Source','Destination','Port','Action'].map(h => <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:'10px', color:'var(--text-dim)', borderBottom:'1px solid var(--border)', fontWeight:500, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>)}</tr></thead>
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
                {cols.map((c,i) => <td key={i} style={{ padding:'9px 12px', color: c==='DENY'?'var(--danger)':c.startsWith('ALLOW')||c.startsWith('REDIRECT')?'var(--success)':'var(--text-muted)', fontFamily:'var(--mono)', fontSize:'12px' }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, color, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', position: 'relative', overflow: 'hidden', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, opacity: 0.7 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>{label}</div>
        <div style={{ color, opacity: 0.5 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '30px', fontWeight: 700, color, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '6px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{delta}</div>
    </div>
  )
}

function ThreatRow({ threat, full }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: '12px', animation: 'slideIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: SEV_COLOR[threat.severity], boxShadow: `0 0 8px ${SEV_COLOR[threat.severity]}`, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{threat.type}</div>
          {full && <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{threat.src}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: SEV_COLOR[threat.severity], textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{threat.severity}</span>
        <span style={{ fontSize: '10px', color: STS_COLOR[threat.status], background: `${STS_COLOR[threat.status]}18`, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{threat.status}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{threat.time}</span>
      </div>
    </div>
  )
}

function PolicyBar({ policy }) {
  const color = policy.compliance >= 90 ? 'var(--success)' : policy.compliance >= 75 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text)' }}>{policy.name}</span>
        <span style={{ fontSize: '12px', color, fontFamily: 'var(--mono)', fontWeight: 600 }}>{policy.compliance}%</span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${policy.compliance}%`, background: color, borderRadius: '2px', boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  )
}

const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }
const panelHeader = { fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600, fontFamily: 'var(--mono)' }

const s = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' },
  sidebar: {
    flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '20px 0', transition: 'width 0.25s ease', overflow: 'hidden',
  },
  sideTop: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0 14px', marginBottom: '4px',
  },
  logoIcon: {
    width: '34px', height: '34px', flexShrink: 0,
    background: 'var(--accent-dim)', border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 12px rgba(0,229,255,0.08)',
  },
  logoText: { fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', flex: 1, whiteSpace: 'nowrap' },
  collapseBtn: {
    background: 'none', border: '1px solid var(--border)', borderRadius: '5px',
    color: 'var(--text-dim)', cursor: 'pointer', padding: '4px 6px',
    display: 'flex', alignItems: 'center', flexShrink: 0,
    transition: 'all 0.15s',
  },
  roleBadge: {
    display: 'flex', flexDirection: 'column', gap: '3px',
    padding: '8px 14px', background: 'var(--surface-2)',
    borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 10px', borderRadius: '8px',
    border: 'none', cursor: 'pointer', fontSize: '13px',
    fontWeight: 500, textAlign: 'left', transition: 'all 0.15s',
    width: '100%', whiteSpace: 'nowrap', overflow: 'hidden',
  },
  sideBottom: { padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '6px' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', background: 'var(--surface-2)',
    borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden',
  },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
    background: 'var(--accent-dim)', border: '1px solid rgba(0,229,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '9px 10px', background: 'transparent',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--danger)', cursor: 'pointer', fontSize: '13px',
    transition: 'background 0.15s', width: '100%', whiteSpace: 'nowrap',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
    background: 'var(--surface)',
  },
  pageTitle: { fontSize: '17px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' },
  pageSubtitle: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
  topbarBadge: {
    display: 'flex', alignItems: 'center', gap: '7px',
    color: 'var(--accent)', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: '20px', padding: '5px 12px',
  },
  content: { flex: 1, overflow: 'auto', padding: '20px 24px' },
}
