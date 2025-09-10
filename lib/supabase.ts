import { createSessionClient } from './session-storage'

// Create session-based client that persists data only during the session
export const supabase = createSessionClient()
export const supabaseAdmin = createSessionClient()