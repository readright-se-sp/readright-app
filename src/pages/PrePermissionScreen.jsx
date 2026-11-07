// PrePermissionScreen.jsx — "Before we start!" (/pre-session).
// Explains what will happen, then asks for camera + mic. This is the one place
// the learner turns the devices on; /quality-check only runs the GO1 checks.
// Permission state comes from useMediaStream, so the native prompt still only
// fires after the learner taps (explanation-before-prompt).

// Sticker style like /results: peach page, brown-outlined cards with a ledge.

import { useLocation, useNavigate } from 'react-router-dom'

import { useMediaStream } from '../hooks/useMediaStream'
import { StickerExitButton } from '../components/ui/ExitButton'
import { Star } from '../components/dashboard/DashboardParts'

const MicIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)

const CameraIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
    <path d="m15.5 10.5 6-3.5v10l-6-3.5z" />
  </svg>
)

const StarIcon = (
  <span aria-hidden="true" className="relative size-7">
    <Star className="inset-0 size-7 text-cta drop-shadow-[0_2px_0_rgba(138,68,54,0.35)]" />
  </span>
)

// Each step: its card fill, the numbered dot, the text colour and an icon.
const STEPS = [
  { n: 1, title: 'Read a story out loud', body: 'Our mic will listen to you', icon: MicIcon,
    card: 'bg-shelf-card', dot: 'bg-cta text-level-ink', ink: 'text-result-olive' },
  { n: 2, title: 'Show us how you read', body: 'Our camera will watch', icon: CameraIcon,
    card: 'bg-result-blue', dot: 'bg-tile-blue text-white', ink: 'text-tile-blue-ink' },
  { n: 3, title: 'See how you did!', body: "We'll show your results", icon: StarIcon,
    card: 'bg-result-pink', dot: 'bg-coral text-white', ink: 'text-level-ink' },
]

// Plain-language recovery copy, keyed by useMediaStream's errorKind.
const DENIED_HELP = {
  permission: 'Ask a grown-up to help turn them on in your browser settings, then tap Try again.',
  inuse: 'Another app may be using your camera. Close it, then tap Try again.',
  notfound: "We can't find a camera on this device. Try a phone or tablet with a camera.",
  insecure: 'ReadRight needs a secure (https) link to use your camera. Open it that way, then tap Try again.',
}

const primaryButton =
  'flex min-h-14 w-full items-center justify-center rounded-2xl border-[3px] border-level-tile-edge bg-level-pill px-4 text-xl font-black text-white shadow-level-tile active:translate-y-1 active:shadow-none disabled:opacity-60'

function OnPill({ children }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border-2 border-level-tile-edge bg-result-green px-3 py-1 text-sm font-black text-goal">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 13 4 4L19 7" />
      </svg>
      {children}
    </span>
  )
}

export default function PrePermissionScreen() {
  const navigate = useNavigate()
  const { state: routeState } = useLocation()
  const { permissionStatus, errorKind, requestStream, retry } = useMediaStream()

  function handleLetsGo() {
    const isFirstSession = !localStorage.getItem('rr_onboarding_seen')
    localStorage.setItem('rr_onboarding_seen', 'true')
    // Leaving unmounts useMediaStream, which releases the devices so
    // /quality-check can re-acquire them without an "in use" error.
    navigate('/quality-check', {
      state: { isFirstSession, devicesReady: true, passageGrade: routeState?.passageGrade },
    })
  }

  return (
    <div className="min-h-dvh bg-level-card font-display text-ink sm:bg-divider sm:py-6">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col overflow-clip bg-level-card px-4.5 pb-7 sm:min-h-0 sm:rounded-[32px] sm:border-[3px] sm:border-level-edge">
        {/* Big soft circle behind Lumi, with a few sparkles. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[260px]">
          <span className="absolute -top-[170px] left-1/2 size-[400px] -translate-x-1/2 rounded-full bg-level-blob" />
          <Star className="right-[13%] top-[64px] size-7 text-coral" />
          <span className="absolute left-[22%] top-[150px] size-2.5 rounded-full bg-cta" />
          <span className="absolute right-[22%] top-[150px] size-3 rounded-full bg-tile-blue" />
        </div>

        {/* Always a way out — e.g. when the camera can't be turned on. */}
        <header className="relative pt-[max(1rem,env(safe-area-inset-top))]">
          <StickerExitButton onClick={() => navigate('/dashboard')} />
        </header>

        <div className="relative flex flex-col items-center text-center">
          <img src="/mascot-reading.svg" alt="" className="-mt-4 h-[124px] w-auto motion-safe:animate-lumi-bob" />
          <h1 className="mt-5 text-[32px] font-black leading-tight text-level-ink">Before we start!</h1>
          <p className="mt-1 text-[17px] font-bold text-coral-ink">Here&apos;s what will happen</p>
        </div>

        <ol className="relative mt-5 flex w-full flex-col gap-3.5">
          {STEPS.map(({ n, title, body, icon, card, dot, ink }) => (
            <li key={n} className={`flex items-center gap-3.5 rounded-[20px] border-[3px] border-level-tile-edge px-4 py-3.5 shadow-level-tile ${card} ${ink}`}>
              <span
                aria-hidden="true"
                className={`flex size-10 flex-none items-center justify-center rounded-full border-[3px] border-level-tile-edge text-[20px] font-black ${dot}`}
              >
                {n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-black leading-tight">{title}</p>
                <p className="text-base font-bold">{body}</p>
              </div>
              <span className="flex flex-none">{icon}</span>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-5 flex items-center gap-2 rounded-full border-2 border-dashed border-goal bg-sticker px-3.5 py-2 text-sm font-bold text-goal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z" />
          </svg>
          Your recording is never saved or shared
        </p>

        <div className="mt-5 w-full" aria-live="polite">
          {permissionStatus === 'checking' && (
            <p className="py-4 text-center text-base font-bold text-level-muted">Getting ready…</p>
          )}

          {permissionStatus === 'pending' && (
            <button type="button" onClick={requestStream} className={primaryButton}>
              Turn on camera &amp; mic
            </button>
          )}

          {permissionStatus === 'requesting' && (
            <p className="rounded-2xl border-2 border-dashed border-level-tile-edge bg-sticker px-4 py-3.5 text-center text-base font-bold text-level-ink">
              Tap <b className="font-black">Allow</b> when your device asks
            </p>
          )}

          {permissionStatus === 'granted' && (
            <>
              <div className="flex justify-center gap-2">
                <OnPill>Mic on</OnPill>
                <OnPill>Camera on</OnPill>
              </div>
              <button type="button" onClick={handleLetsGo} className={`mt-3.5 ${primaryButton}`}>
                Let&apos;s go!
              </button>
            </>
          )}

          {permissionStatus === 'denied' && (
            <>
              <div role="alert" className="flex gap-3 rounded-[20px] border-[3px] border-level-tile-edge bg-result-pink px-4 py-3.5 text-left">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 flex-none text-brand">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="text-base font-black text-ink">We need your camera &amp; mic to start</p>
                  <p className="mt-0.5 text-base font-semibold text-ink-soft">
                    {DENIED_HELP[errorKind] ?? 'We could not turn them on. Tap Try again.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={retry} className={`mt-3.5 ${primaryButton}`}>
                Try again
              </button>
            </>
          )}

          {/* Always offered, so the learner can leave without starting. */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl border-[3px] border-level-tile-edge px-4 text-lg font-black text-level-ink active:bg-level-blob/40"
          >
            Back to my dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
