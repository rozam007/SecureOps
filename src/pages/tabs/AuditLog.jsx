import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const LEVEL_COLOR = { info: '#58a6ff', warning: '#f0a500', critical: '#ff4d6d' }
const LEVEL_BG = { info: 'rgba(88,166,255,0.08)', warning: 'rgba(240,165,0,0.08)', critical: 'rgba(255,77,109,0.08)' }

export default function AuditLog() {
  const { getAuditLog } = useAuth()
  const [filter, setFilter] = useState('all')
  const log = getAuditLog()
  const filtered = filter === 'all' ? log : log.filter(e => e.level === filter)

  const fmt = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString() + ' ' + d.toLocaleDateString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Total Events', value: log.length, color: 'var(--text)' },
          { label: 'Info', value: log.filter(e => e.level === 'info').length, color: '#58a6ff' },
          { label: 'Warnings', value: log.filter(e => e.level === 'warning').length, color: '#f0a500' },
          { label: 'Critical', value: log.filter(e => e.level === 'critical').length, color: '#ff4d6d' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 600, color: s.color, fontFamily: 'var(--mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Audit Event Log</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'info', 'warning', 'critical'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(0,255,170,0.3)' : 'var(--border)'}`,
                borderRadius: '6px', color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '11px', padding: '4px 10px', textTransform: 'capitalize',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '13px' }}>
            No audit events yet. Login, logout, or run an attack simulation to generate events.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Timestamp', 'User', 'Action', 'Level', 'Detail'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(e.timestamp)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '12px' }}>{e.user}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)' }}>{e.action}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: LEVEL_COLOR[e.level], background: LEVEL_BG[e.level], fontSize: '10px', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.level}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
