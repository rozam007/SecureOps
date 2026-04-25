import { createContext, useContext, useState } from 'react'

// Hardcoded credentials with RBAC roles (client-side only)
const USERS = [
  {
    username: 'admin',
    password: 'Admin@1234',
    role: 'Administrator',
    // Admin has full access to all modules
    permissions: ['overview', 'threats', 'policies', 'network', 'audit', 'attack-sim', 'risk-matrix', 'compliance'],
  },
  {
    username: 'analyst',
    password: 'Analyst@1234',
    role: 'Security Analyst',
    // Analyst has read-only access, no attack-sim or audit admin
    permissions: ['overview', 'threats', 'policies', 'network', 'risk-matrix', 'compliance'],
  },
]

const AuthContext = createContext(null)

// Persist audit log in sessionStorage
const getAuditLog = () => {
  try { return JSON.parse(sessionStorage.getItem('secureops_audit') || '[]') } catch { return [] }
}
const saveAuditLog = (log) => sessionStorage.setItem('secureops_audit', JSON.stringify(log))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('secureops_user')
    return stored ? JSON.parse(stored) : null
  })

  const addAuditEntry = (action, detail, level = 'info') => {
    const log = getAuditLog()
    log.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      detail,
      level, // info | warning | critical
      user: user?.username || 'system',
    })
    saveAuditLog(log.slice(0, 200)) // keep last 200 entries
  }

  const login = (username, password) => {
    const match = USERS.find(u => u.username === username && u.password === password)
    if (match) {
      const session = {
        username: match.username,
        role: match.role,
        permissions: match.permissions,
        loginTime: new Date().toISOString(),
      }
      sessionStorage.setItem('secureops_user', JSON.stringify(session))
      setUser(session)
      // Audit entry for successful login
      const log = getAuditLog()
      log.unshift({ id: Date.now(), timestamp: new Date().toISOString(), action: 'LOGIN_SUCCESS', detail: `User "${username}" authenticated successfully`, level: 'info', user: username })
      saveAuditLog(log.slice(0, 200))
      return { success: true }
    }
    // Audit failed login attempt
    const log = getAuditLog()
    log.unshift({ id: Date.now(), timestamp: new Date().toISOString(), action: 'LOGIN_FAILED', detail: `Failed login attempt for username "${username}"`, level: 'warning', user: username })
    saveAuditLog(log.slice(0, 200))
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    addAuditEntry('LOGOUT', `User "${user?.username}" session terminated`, 'info')
    sessionStorage.removeItem('secureops_user')
    setUser(null)
  }

  const hasPermission = (module) => user?.permissions?.includes(module) ?? false

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, addAuditEntry, getAuditLog }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
