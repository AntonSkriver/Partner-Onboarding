// Session management for Class2Class Partner Module
// Handles login/logout and role-based authentication

export interface UserSession {
  email: string
  role: 'partner' | 'teacher' | 'student'
  organization?: string
  name?: string
  loginTime: string
}

export const SESSION_KEY = 'class2class_session'

// Get current user session
export function getCurrentSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  
  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData) as UserSession
    
    // Check if session is expired (24 hours)
    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      clearSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error reading session:', error)
    clearSession()
    return null
  }
}

// Create new user session
export function createSession(sessionData: Omit<UserSession, 'loginTime'>): void {
  if (typeof window === 'undefined') return
  
  const session: UserSession = {
    ...sessionData,
    loginTime: new Date().toISOString()
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// Clear current session (logout)
export function clearSession(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('partner_session') // Legacy cleanup
  
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

// Session event handlers for login/logout
export function onSessionChange(callback: (session: UserSession | null) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
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
  if (typeof window === 'undefined') return
  
  const session = getCurrentSession()
  if (!session) {
    window.location.href = '/sign-in'
    return
  }
  
  switch (session.role) {
    case 'partner':
      window.location.href = '/partner/dashboard'
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