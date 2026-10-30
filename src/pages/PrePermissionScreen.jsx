// PrePermissionScreen.jsx — "Before we start!" (/pre-session).
// Explains what will happen, then asks for camera + mic. This is the one place
// the learner turns the devices on; /quality-check only runs the GO1 checks.
// Permission state comes from useMediaStream, so the native prompt still only
// fires after the learner taps (explanation-before-prompt).
import { useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import ExitButton from '../components/ui/ExitButton'

const STEPS = [
  { n: 1, title: 'Read a story out loud', body: 'Our mic will listen to you', card: 'bg-peach', dot: 'bg-amber' },
  { n: 2, title: 'Show us how you read', body: 'Our camera will watch', card: 'bg-sky-soft', dot: 'bg-sky' },
  { n: 3, title: 'See how you did!', body: "We'll show your results", card: 'bg-coral-soft', dot: 'bg-coral' },
]

// Plain-language recovery copy, keyed by useMediaStream's errorKind.
const DENIED_HELP = {
  permission: 'Ask a grown-up to help turn them on in your browser settings, then tap Try again.',
  inuse: 'Another app may be using your camera. Close it, then tap Try again.',
  notfound: "We can't find a camera on this device. Try a phone or tablet with a camera.",
  insecure: 'ReadRight needs a secure (https) link to use your camera. Open it that way, then tap Try again.',
}

const primaryButton =
  'flex min-h-[44px] w-full items-center justify-center rounded-full bg-brand py-4 text-[19px] font-extrabold text-white shadow-[0px_5px_0px_#7a1f1a] active:translate-y-1 active:shadow-[0px_1px_0px_#7a1f1a] disabled:opacity-60'

function OnPill({ children }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1.5 text-sm font-extrabold text-mint-ink">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 13 4 4L19 7" />
      </svg>
      {children}
    </span>
  )
}

export default function PrePermissionScreen() {
  const navigate = useNavigate()
  const { permissionStatus, errorKind, requestStream, retry } = useMediaStream()

  function handleLetsGo() {
    const isFirstSession = !localStorage.getItem('rr_onboarding_seen')
    localStorage.setItem('rr_onboarding_seen', 'true')
    // Leaving unmounts useMediaStream, which releases the devices so
    // /quality-check can re-acquire them without an "in use" error.
    navigate('/quality-check', { state: { isFirstSession, devicesReady: true } })
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f3e6e3] px-4 py-6 font-display">
      <div className="relative flex w-full max-w-[360px] flex-col items-center rounded-[28px] border-2 border-card-border bg-[#fffdfc] px-5 pt-7 pb-6 shadow-[0px_18px_40px_0px_rgba(120,60,50,0.12)]">
        {/* Always a way out — e.g. when the camera can't be turned on. */}
        <ExitButton onClick={() => navigate('/dashboard')} className="absolute left-3 top-3" />

        <img src="/mascot-reading.svg" alt="" className="h-[120px] w-auto" />
        <h1 className="mt-1.5 text-[30px] font-black leading-tight text-ink">Before we start!</h1>
        <p className="mt-1 text-base font-semibold text-ink-soft">Here&apos;s what will happen</p>

        <ol className="mt-5 flex w-full flex-col gap-3">
          {STEPS.map(({ n, title, body, card, dot }) => (
            <li key={n} className={`flex items-center gap-3.5 rounded-[18px] px-4 py-3.5 ${card}`}>
              <span
                aria-hidden="true"
                className={`flex size-10 flex-none items-center justify-center rounded-full text-[20px] font-black text-white ${dot}`}
              >
                {n}
              </span>
              <div>
                <p className="text-[17px] font-extrabold text-ink">{title}</p>
                <p className="text-base font-semibold text-ink-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-4 flex items-center gap-2 rounded-full border-2 border-dashed border-card-border px-3.5 py-2 text-sm font-bold text-ink-muted">
          <span aria-hidden="true" className="size-2 rounded-full bg-mint" />
          Your recording is never saved or shared
        </p>

        <div className="mt-5 w-full" aria-live="polite">
          {permissionStatus === 'checking' && (
            <p className="py-4 text-center text-base font-semibold text-ink-muted">Getting ready…</p>
          )}

          {permissionStatus === 'pending' && (
            <button type="button" onClick={requestStream} className={primaryButton}>
              Turn on camera &amp; mic
            </button>
          )}

          {permissionStatus === 'requesting' && (
            <p className="rounded-[18px] bg-peach px-4 py-3.5 text-center text-base font-bold text-ink-soft">
              Tap <b className="text-ink">Allow</b> when your device asks
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
              <div role="alert" className="flex gap-3 rounded-[18px] bg-coral-soft px-4 py-3.5 text-left">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 flex-none text-coral">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="text-base font-extrabold text-ink">We need your camera &amp; mic to start</p>
                  <p className="mt-0.5 text-base font-semibold text-ink-muted">
                    {DENIED_HELP[errorKind] ?? 'We could not turn them on. Tap Try again.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={retry} className={`mt-3.5 ${primaryButton}`}>
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center text-base font-extrabold text-brand"
              >
                Back to my dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
