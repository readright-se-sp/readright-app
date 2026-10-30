import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

/**
 * AuthContext — provides Supabase Auth state to the whole app (RR-010).
 *
 * useAuth subscribes to onAuthStateChange exactly once here, and every
 * component reads the shared value via useAuthContext(). This avoids each
 * consumer opening its own auth subscription.
 *
 * Provided value: { session, user, signIn, signUp, loading, signOut }.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Provider + consumer hook are colocated by design (ARCHITECTURE.md): this one
// file owns AuthContext, so Fast Refresh's component-only-export rule is waived
// here. Editing this file triggers a full reload rather than an HMR update.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuthContext must be used within an <AuthProvider>')
  }
  return context
}
