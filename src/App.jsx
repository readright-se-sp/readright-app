import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard }      from './components/auth/AuthGuard.jsx'
import LoginPage          from './pages/LoginPage.jsx'
import RegisterPage       from './pages/RegisterPage.jsx'
import SessionScreen      from './pages/SessionScreen.jsx'
import SessionResultsPage from './pages/SessionResultsPage.jsx'
import DashboardPage      from './pages/DashboardPage.jsx'
import QualityCheckScreen from './pages/QualityCheckScreen.jsx'
import PrePermissionScreen from './pages/PrePermissionScreen.jsx'

/**
 * Route map (RR-003 skeleton):
 *
 *   /login      — UC-1.1  Learner authentication
 *   /register   — Learner self sign-up (same single Learner role)
 *   /session    — UC-1.2 → UC-2.x → UC-3.x  GO1 quality checks + recording
 *   /results    — UC-4.1  Session results display
 *   /dashboard  — UC-4.3 + UC-4.4  Personal progress dashboard
 *
 * Auth guards (redirect unauthenticated → /login) are provided by AuthGuard
 * (RR-010), which wraps every learner-only route below.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<RegisterPage />} />
      <Route path="/session"   element={<AuthGuard><SessionScreen /></AuthGuard>} />
      <Route path="/results"   element={<AuthGuard><SessionResultsPage /></AuthGuard>} />
      <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
      <Route path="/quality-check" element={<AuthGuard><QualityCheckScreen /></AuthGuard>} />
      <Route path="/pre-session" element={<AuthGuard><PrePermissionScreen /></AuthGuard>} />

      {/* Default: redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

      
    </Routes>
  )
}
