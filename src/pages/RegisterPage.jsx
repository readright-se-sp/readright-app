// RegisterPage.jsx — learner self sign-up (single Learner role).
// Auth state flows through AuthContext; this page never touches the Supabase
// client directly. UI matches the "Register Screen" design and mirrors
// LoginPage's card, field, and button styling.
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { GRADE_LEVELS } from '../utils/gradeLevels'
const MIN_PASSWORD_LENGTH = 6

const labelClass =
  'px-1 text-[12px] font-extrabold uppercase leading-[16px] tracking-[0.96px] text-ink-soft'
const inputClass =
  'min-h-[44px] w-full rounded-[12px] border-2 border-card-border bg-white py-3.5 text-[16px] font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-card-border focus:border-brand'

function FieldIcon({ children }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-card-border"
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
      className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-card-border"
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
function validate({ fullName, password, confirmPassword, gradeLevel, age, agreed }) {
  if (!fullName.trim()) return 'Please type your full name so we know what to call you.'
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
  if (error.code === 'email_address_invalid' || /invalid.*email/i.test(error.message)) {
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
    const problem = validate({ fullName, password, confirmPassword, gradeLevel, age, agreed })
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
    <div className="min-h-dvh flex items-center justify-center bg-[#f7ebe9] px-4 py-8 font-display">
      <div className="w-full max-w-[340px]">
        <div className="flex flex-col items-center rounded-[24px] border-2 border-card-border bg-white/85 px-8 pt-8 pb-8 shadow-[0px_12px_40px_0px_rgba(140,123,107,0.12)] backdrop-blur-[4px] sm:px-10">
          {/* Mascot */}
          <div className="relative mb-2 flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute size-[112px] rounded-full bg-[#ffb4ab]/20 blur-[12px]"
            />
            <img src="/mascot-reading.svg" alt="" className="relative h-[120px] w-auto" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[32px] font-extrabold leading-[40px] text-ink">
              Join ReadRight!
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-ink-soft">
              Your reading adventure starts here.
            </p>
          </div>

          {needsConfirmation ? (
            <div role="status" className="mt-6 flex w-full flex-col items-center gap-3 text-center">
              <p className="rounded-[12px] bg-badge-bg px-4 py-4 text-base font-semibold text-ink">
                Almost done! We sent a message to <span className="font-extrabold">{email}</span>.
                Open it and tap the link inside, then come back and log in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 flex w-full flex-col gap-4">
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
                      className={`${inputClass} appearance-none pl-4 pr-10 ${gradeLevel ? '' : 'text-card-border'}`}
                    >
                      <option value="" disabled>Select</option>
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g} className="text-ink">Grade {g}</option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand"
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
                  className="size-6 flex-none cursor-pointer rounded-[7px] accent-brand"
                />
                {/* Terms / Privacy pages don't exist yet — shown as emphasized text, not links. */}
                <span className="text-base text-ink-soft">
                  I agree to the <span className="font-extrabold text-brand">Terms</span> and{' '}
                  <span className="font-extrabold text-brand">Privacy Policy</span>
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[24px] font-bold leading-[32px] text-white shadow-[0px_4px_0px_#871f1a] disabled:opacity-60"
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
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[16px] font-normal leading-[24px] text-ink-soft">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center gap-1 text-[18px] font-bold leading-[28px] text-brand"
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
