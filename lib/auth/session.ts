// Session management for Class2Class Partner Module
// Handles login/logout and role-based authentication

export interface UserSession {
  email: string
  role: 'partner' | 'teacher' | 'student' | 'parent'
  organization?: string
  name?: string
  loginTime: string
}

export const SESSION_KEY = 'class2class_session'
export const SESSION_BACKUP_KEY = 'class2class_session_backup'

const isBrowser = () => typeof window !== 'undefined'

const readSessionFromStorage = (key: string): UserSession | null => {
  if (!isBrowser()) return null

  try {
    const sessionData = window.localStorage.getItem(key)
    if (!sessionData) return null
    return JSON.parse(sessionData) as UserSession
  } catch (error) {
    console.error('Error reading stored session:', error)
    return null
  }
}

const writeSessionToStorage = (key: string, session: UserSession | null) => {
  if (!isBrowser()) return

  if (!session) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, JSON.stringify(session))
}

// Get current user session
export function getCurrentSession(): UserSession | null {
  if (!isBrowser()) return null

  const session = readSessionFromStorage(SESSION_KEY)
  if (!session) return null

  const loginTime = new Date(session.loginTime)
  const now = new Date()
  const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

  if (Number.isNaN(loginTime.getTime()) || hoursDiff > 24) {
    clearSession()
    return null
  }

  return session
}

// Create new user session
export function createSession(sessionData: Omit<UserSession, 'loginTime'>): void {
  if (!isBrowser()) return

  const session: UserSession = {
    ...sessionData,
    loginTime: new Date().toISOString()
  }

  writeSessionToStorage(SESSION_KEY, session)
}

// Clear current session (logout)
export function clearSession(): void {
  if (!isBrowser()) return

  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem('partner_session') // Legacy cleanup

  // Clear any other session-related data
  sessionStorage.clear()
}

// Check if user has specific role
export function hasRole(role: UserSession['role']): boolean {
  const session = getCurrentSession()
  return session?.role === role
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentSession() !== null
}

// Get user role
export function getUserRole(): UserSession['role'] | null {
  const session = getCurrentSession()
  return session?.role || null
}

export function getSessionBackup(): UserSession | null {
  return readSessionFromStorage(SESSION_BACKUP_KEY)
}

export function hasSessionBackup(): boolean {
  return Boolean(getSessionBackup())
}

export function setSessionBackup(session: UserSession): void {
  writeSessionToStorage(SESSION_BACKUP_KEY, session)
}

export function ensureSessionBackup(): void {
  if (!isBrowser()) return
  if (hasSessionBackup()) return

  const current = getCurrentSession()
  if (current) {
    setSessionBackup(current)
  }
}

export function clearSessionBackup(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(SESSION_BACKUP_KEY)
}

export function restoreSessionFromBackup(): UserSession | null {
  if (!isBrowser()) return null

  const backup = getSessionBackup()
  if (!backup) return null

  writeSessionToStorage(SESSION_KEY, backup)
  clearSessionBackup()
  return backup
}

export function switchToPreviewSession(sessionData: Omit<UserSession, 'loginTime'>): void {
  if (!isBrowser()) return
  ensureSessionBackup()
  createSession(sessionData)
}

// Session event handlers for login/logout
export function onSessionChange(callback: (session: UserSession | null) => void): () => void {
  if (!isBrowser()) return () => {}
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) {
      const session = getCurrentSession()
      callback(session)
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

// Redirect user based on their role
export function redirectBasedOnRole(defaultPath = '/'): void {
  if (!isBrowser()) return
  
  const session = getCurrentSession()
  if (!session) {
    window.location.href = '/sign-in'
    return
  }
  
  switch (session.role) {
    case 'partner':
      window.location.href = '/partner/dashboard'
      break
    case 'parent':
      window.location.href = '/parent/profile/overview'
      break
    case 'teacher':
      window.location.href = '/dashboard'
      break
    case 'student':
      window.location.href = '/student/dashboard'
      break
    default:
      window.location.href = defaultPath
  }
}

const TEACHER_PREVIEW_TEMPLATE: Omit<UserSession, 'loginTime'> = {
  email: 'anne.holm@orestadgym.dk',
  role: 'teacher',
  organization: 'Ørestad Gymnasium',
  name: 'Anne Holm',
}

export function startTeacherPreviewSession(
  overrides: Partial<Omit<UserSession, 'loginTime'>> = {},
): void {
  switchToPreviewSession({
    ...TEACHER_PREVIEW_TEMPLATE,
    ...overrides,
    role: 'teacher',
  })
}
