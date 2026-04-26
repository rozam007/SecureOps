import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LEVEL_COLOR = { info: '#4da6ff', warning: '#ffb020', critical: '#ff3d6b' }
const LEVEL_BG    = { info: 'rgba(77,166,255,0.08)', warning: 'rgba(255,176,32,0.08)', critical: 'rgba(255,61,107,0.08)' }
const LEVEL_ICON  = { info: 'ℹ', warning: '⚠', critical: '✕' }

export default function AuditLog() {
  const { getAuditLog } = useAuth()
  const [filter, setFilter] = useState('all')
  const log = getAuditLog()
  const filtered = filter === 'all' ? log : log.filter(e => e.level === filter)

  const fmt = (iso) => {
    const d = new Date(iso)
    return { time: d.toLocaleTimeString(), date: d.toLocaleDateString() }
  }

  const counts = {
    total: log.length,
    info: log.filter(e => e.level === 'info').length,
    warning: log.filter(e => e.level === 'warning').length,
    critical: log.filter(e => e.level === 'critical').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.3s ease' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Events', value: counts.total, color: 'var(--text)', icon: '≡' },
          { label: 'Info', value: counts.info, color: '#4da6ff', icon: 'ℹ' },
          { label: 'Warnings', value: counts.warning, color: '#ffb020', icon: '⚠' },
          { label: 'Critical', value: counts.critical, color: '#ff3d6b', icon: '✕' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.color, opacity: 0.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>{s.label}</span>
              <span style={{ fontSize: '14px', color: s.color, opacity: 0.6 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, fontFamily: 'var(--mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', fontWeight: 600 }}>
            Audit Event Log
            <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>{filtered.length}</span>
          </span>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['all', 'info', 'warning', 'critical'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? (f === 'all' ? 'var(--accent-dim)' : LEVEL_BG[f]) : 'transparent',
                border: `1px solid ${filter === f ? (f === 'all' ? 'rgba(0,229,255,0.25)' : LEVEL_COLOR[f] + '40') : 'var(--border)'}`,
                borderRadius: '6px',
                color: filter === f ? (f === 'all' ? 'var(--accent)' : LEVEL_COLOR[f]) : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '10px', padding: '4px 10px',
                textTransform: 'capitalize', fontFamily: 'var(--mono)', letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: '13px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.3 }}>≡</div>
            No audit events yet. Login, logout, or run an attack simulation to generate events.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Timestamp', 'User', 'Action', 'Level', 'Detail'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: '10px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => {
                  const { time, date } = fmt(e.timestamp)
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', animation: 'fadeIn 0.2s ease' }}>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)' }}>{time}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)' }}>{date}</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '12px', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: '4px' }}>{e.user}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)' }}>{e.action}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ color: LEVEL_COLOR[e.level], background: LEVEL_BG[e.level], fontSize: '10px', padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {LEVEL_ICON[e.level]} {e.level}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>{e.detail}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
