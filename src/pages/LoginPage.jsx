// LoginPage.jsx — learner authentication (RR-010, UC-1.1)
// Auth state flows through AuthContext; this page never touches the Supabase
// client directly. UI matches the Figma "LoginPage" design (node 35:2).
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, signIn } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Already signed in → skip login and land on the dashboard
  // (routing table: /login redirects to /dashboard if authenticated).
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn({ email, password })
    if (error) {
      // Never surface raw Supabase error strings to a Grade 4 learner.
      setError(
        'We could not sign you in. Please check your email and password, then tap Start Reading again.'
      )
      setLoading(false)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f7ebe9] px-4 py-8 font-display">
      <div className="w-full max-w-[340px]">
        {/* Login card */}
        <div className="flex flex-col items-center rounded-[24px] border-2 border-card-border bg-white/85 px-10 pt-10 pb-8 shadow-[0px_12px_40px_0px_rgba(140,123,107,0.12)] backdrop-blur-[4px]">
          {/* Mascot */}
          <div className="relative mb-2 flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute size-[128px] rounded-full bg-[#ffb4ab]/20 blur-[12px]"
            />
            <img src="/mascot-reading.svg" alt="" className="relative h-[152px] w-auto" />
          </div>

          {/* Welcome text */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[32px] font-extrabold leading-[40px] text-ink">
              Welcome Back!
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-ink-soft">
              Ready to go on another adventure?
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="px-1 text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-ink-soft"
              >
                Email
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-card-border"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="min-h-[44px] w-full rounded-[12px] border-2 border-card-border bg-white py-3.5 pl-10 pr-4 text-[16px] font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-card-border focus:border-brand"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 pb-4">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="password"
                  className="text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-ink-soft"
                >
                  Password
                </label>
                {/* Stub: no recovery flow / route exists yet. */}
                <button
                  type="button"
                  className="-my-3 inline-flex min-h-[44px] items-center px-1 text-[11px] font-bold leading-[16px] text-brand"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-card-border"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="min-h-[44px] w-full rounded-[12px] border-2 border-card-border bg-white py-3.5 pl-10 pr-12 text-[16px] font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-card-border focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-card-border"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-[12px] bg-badge-bg px-4 py-3 text-center text-base font-semibold text-brand"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[24px] font-bold leading-[32px] text-white shadow-[0px_4px_0px_#871f1a] disabled:opacity-60"
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  <span>Start Reading</span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Registration link → learner self sign-up */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[16px] font-normal leading-[24px] text-ink-soft">
              New to ReadRight?
            </span>
            <Link
              to="/register"
              className="inline-flex min-h-[44px] items-center gap-1 text-[18px] font-bold leading-[28px] text-brand"
            >
              Join ReadRight
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
