// RegisterPage.jsx — learner self sign-up (single Learner role).
// Auth state flows through AuthContext; this page never touches the Supabase
// client directly. UI matches the "Register Screen" design and mirrors
// LoginPage's card, field, and button styling.
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { LEARNER_GRADES } from '../utils/gradeLevels'
import { SkyBackground } from '../components/ui/SkyBackground'
import { STICKER_PRIMARY } from '../components/ui/stickerStyles'
const MIN_PASSWORD_LENGTH = 6

const labelClass =
  'px-1 text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-sky-ink'
const inputClass =
  'min-h-[44px] w-full rounded-[12px] border-2 border-sky bg-white py-2.5 text-[16px] font-semibold text-sky-deep outline-none placeholder:font-semibold placeholder:text-sky-muted hover:border-amber focus:border-amber'

function FieldIcon({ children }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-muted"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  )
}

function LockIcon() {
  return (
    <FieldIcon>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </FieldIcon>
  )
}

function ShowPasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-sky-muted"
    >
      {shown ? (
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
  )
}

// Plain-language validation for a Grade 4 learner; null when the form is OK.
function validate({ fullName, email, password, confirmPassword, gradeLevel, age, agreed }) {
  if (!fullName.trim()) return 'Please type your full name so we know what to call you.'
  if (!email.trim()) return 'Please type your email so you can log in later.'
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Your password is too short. Please use at least ${MIN_PASSWORD_LENGTH} letters or numbers.`
  if (password !== confirmPassword)
    return 'Your two passwords are not the same. Please type the same password in both boxes.'
  if (!gradeLevel) return 'Please pick your grade level from the list.'
  const ageNum = Number(age)
  if (!Number.isInteger(ageNum) || ageNum < 5 || ageNum > 18)
    return 'Please type your age as a number, like 9.'
  if (!agreed) return 'Please tick the box to agree to the Terms and Privacy Policy.'
  return null
}

// Never surface raw Supabase error strings to a Grade 4 learner.
function friendlySignUpError(error) {
  if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) {
    return 'This email already has an account. Tap Log In below to sign in instead.'
  }
  if (error.code === 'weak_password') {
    return 'That password is too easy to guess. Please try a longer one with letters and numbers.'
  }
  if (error.code === 'email_address_invalid' || /invalid.*email|email.*invalid/i.test(error.message)) {
    return 'That email does not look right. Please check it and tap Create Account again.'
  }
  return 'We could not create your account right now. Please check your internet, then tap Create Account again.'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { session, signUp } = useAuthContext()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gradeLevel, setGradeLevel] = useState('')
  const [age, setAge] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  // Already signed in (or sign-up returned a live session) → skip ahead.
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validate({ fullName, email, password, confirmPassword, gradeLevel, age, agreed })
    if (problem) {
      setError(problem)
      return
    }

    setLoading(true)
    setError(null)
    const { session: newSession, error } = await signUp({
      email,
      password,
      fullName: fullName.trim(),
      gradeLevel: Number(gradeLevel),
      age: Number(age),
    })
    setLoading(false)
    if (error) {
      setError(friendlySignUpError(error))
    } else if (!newSession) {
      // Project requires email confirmation — no session until the link is tapped.
      setNeedsConfirmation(true)
    }
    // With a session, the auth listener updates `session` and the effect redirects.
  }

  return (
    <div className="relative min-h-dvh overflow-clip font-display sm:flex sm:items-center sm:justify-center sm:py-8">
      <SkyBackground />
      {/* Like LoginPage but without Lumi, so the long form fits: the sheet sits at
          the bottom with the sky showing above it. sm+: a centred, fully rounded sheet. */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-end pt-[max(1.5rem,env(safe-area-inset-top))] sm:min-h-0 sm:pt-0">
        {/* Sign-up sheet */}
        <div className="flex flex-col items-center rounded-t-[32px] bg-white px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(60,110,150,0.15)] sm:rounded-[32px] sm:px-10 sm:shadow-[0_12px_40px_rgba(60,110,150,0.18)]">

          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-[28px] font-extrabold leading-[34px] text-sky-deep">
              Join ReadRight!
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-sky-ink">
              Your reading adventure starts here.
            </p>
          </div>

          {needsConfirmation ? (
            <div role="status" className="mt-6 flex w-full flex-col items-center gap-3 text-center">
              <p className="rounded-[12px] bg-sky-soft px-4 py-4 text-base font-semibold text-sky-deep">
                Almost done! We sent a message to <span className="font-extrabold">{email}</span>.
                Open it and tap the link inside, then come back and log in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-5 flex w-full flex-col gap-3">
              {/* Full name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fullName" className={labelClass}>Full Name</label>
                <div className="relative">
                  <FieldIcon>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                  </FieldIcon>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`${inputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className={labelClass}>Email</label>
                <div className="relative">
                  <FieldIcon>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </FieldIcon>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`${inputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <LockIcon />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className={`${inputClass} pl-10 pr-12`}
                  />
                  <ShowPasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <LockIcon />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`${inputClass} pl-10 pr-12`}
                  />
                  <ShowPasswordToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                </div>
              </div>

              {/* Grade level + age */}
              <div className="grid grid-cols-[1.7fr_1fr] gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="gradeLevel" className={labelClass}>Grade Level</label>
                  <div className="relative">
                    <select
                      id="gradeLevel"
                      required
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className={`${inputClass} appearance-none pl-4 pr-10 ${gradeLevel ? '' : 'text-sky-muted'}`}
                    >
                      <option value="" disabled>Select</option>
                      {LEARNER_GRADES.map((g) => (
                        <option key={g} value={g} className="text-sky-deep">Grade {g}</option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-ink"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="age" className={labelClass}>Age</label>
                  <input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    min="5"
                    max="18"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 9"
                    className={`${inputClass} px-4`}
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="size-6 flex-none cursor-pointer rounded-[7px] accent-sky-ink"
                />
                {/* Terms / Privacy pages don't exist yet — shown as emphasized text, not links. */}
                <span className="text-base text-sky-ink">
                  I agree to the <span className="font-extrabold text-sky-deep">Terms</span> and{' '}
                  <span className="font-extrabold text-sky-deep">Privacy Policy</span>
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-[12px] bg-badge-bg px-4 py-3 text-center text-base font-semibold text-brand"
                >
                  {error}
                </p>
              )}

              {/* Submit — sticks to the bottom of the screen while the form scrolls on
                  short phones, so the button is always in view. */}
              <div className="sticky bottom-0 -mx-1 bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${STICKER_PRIMARY} min-h-15 gap-2 px-4 text-[22px]`}
                >
                  {loading ? (
                    'Creating account…'
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5">
            <span className="text-[16px] font-normal leading-[24px] text-sky-ink">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center gap-1 text-[18px] font-extrabold leading-[28px] text-link-orange underline decoration-2 underline-offset-4"
            >
              Log In
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
