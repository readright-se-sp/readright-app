// LoginPage.jsx — learner authentication (RR-010, UC-1.1)
// Auth state flows through AuthContext; this page never touches the Supabase
// client directly. UI matches the Figma "LoginPage" design (node 35:2).
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { SkyBackground } from '../components/ui/SkyBackground'
import { STICKER_PRIMARY } from '../components/ui/stickerStyles'

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
    <div className="relative min-h-dvh overflow-hidden font-display sm:flex sm:items-center sm:justify-center sm:py-8">
      <SkyBackground />
      {/* Mobile: Lumi on the sky, then a full-width sheet from about halfway down.
          sm+: the same layout in a centred column with a fully rounded sheet. */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col sm:min-h-0">
        {/* Lumi floats on the sky above the sheet; this area takes the space left over. */}
        <div className="flex min-h-[30dvh] flex-1 items-end justify-center px-4 pb-5 pt-[max(2.5rem,env(safe-area-inset-top))] sm:flex-none sm:pt-6">
          <div className="relative flex items-center justify-center">
            <div aria-hidden="true" className="absolute size-[150px] rounded-full bg-white/50 blur-[18px]" />
            <img src="/mascot-reading.svg" alt="" className="relative h-[170px] w-auto motion-safe:animate-lumi-bob" />
          </div>
        </div>

        {/* Login sheet */}
        <div className="flex flex-col items-center rounded-t-[32px] bg-white px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(60,110,150,0.15)] sm:rounded-[32px] sm:px-10 sm:shadow-[0_12px_40px_rgba(60,110,150,0.18)]">
          {/* App name, same wordmark as the dashboard header */}
          <p className="mb-4 text-[22px] font-black text-brand">ReadRight</p>

          {/* Welcome text */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[32px] font-extrabold leading-[40px] text-sky-deep">
              Welcome Back!
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-sky-ink">
              Ready to go on another adventure?
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="px-1 text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-sky-ink"
              >
                Email
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-muted"
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
                  className="min-h-[44px] w-full rounded-[12px] border-2 border-sky bg-white py-3.5 pl-10 pr-4 text-[16px] font-semibold text-sky-deep outline-none placeholder:font-semibold placeholder:text-sky-muted hover:border-amber focus:border-amber"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 pb-4">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="password"
                  className="text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-sky-ink"
                >
                  Password
                </label>
                {/* Stub: no recovery flow / route exists yet. */}
                <button
                  type="button"
                  className="-my-3 inline-flex min-h-[44px] items-center px-1 text-[11px] font-bold leading-[16px] text-sky-ink"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-muted"
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
                  className="min-h-[44px] w-full rounded-[12px] border-2 border-sky bg-white py-3.5 pl-10 pr-12 text-[16px] font-semibold text-sky-deep outline-none placeholder:font-semibold placeholder:text-sky-muted hover:border-amber focus:border-amber"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-sky-muted"
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
              className={`${STICKER_PRIMARY} min-h-15 gap-2 px-4 text-[22px]`}
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5">
            <span className="text-[16px] font-normal leading-[24px] text-sky-ink">
              New to ReadRight?
            </span>
            <Link
              to="/register"
              className="inline-flex min-h-[44px] items-center gap-1 text-[18px] font-extrabold leading-[28px] text-link-orange underline decoration-2 underline-offset-4"
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
