// QualityCheckScreen.jsx — "Get ready!" GO1 gate (/quality-check).
// Live camera preview + the four quality checks as a 2×2 grid. Camera + mic
// are turned on in /pre-session; this screen only re-acquires and checks.
// Sticker style like /pre-session and /results: peach page, brown-outlined
// cards with a ledge.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import { useQualityGate } from '../hooks/useQualityGate'
import { detectPlatform } from '../utils/platform'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import { StickerExitButton } from '../components/ui/ExitButton'
import { LogoMark } from '../components/icons'

// Per-check line icons (inherit the icon-circle's text color via currentColor).
const ICONS = {
  mic: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  ),
  noise: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16.5 9.5a3.5 3.5 0 0 1 0 5" />
    </svg>
  ),
  camera: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
      <path d="M9 9.5h.01M15 9.5h.01" strokeWidth="3" />
    </svg>
  ),
  lighting: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
}

// Design order: mic, noise, face, light. Labels are kid-friendly actions.
const CHECK_ROWS = [
  { key: 'mic', label: 'Say "Hi!"' },
  { key: 'noise', label: 'Quiet room' },
  { key: 'camera', label: 'Face in circle' },
  { key: 'lighting', label: 'Bright light' },
]

// Status shown with color AND icon/text — never color alone (NFR-U1).
const STATUS_STYLE = {
  PASS: { card: 'bg-result-green', pill: 'bg-goal text-white', text: 'Good!' },
  FAIL: { card: 'bg-result-pink', pill: 'bg-brand text-white', text: 'Fix me' },
  CHECKING: { card: 'bg-shelf-card', pill: 'bg-cta text-level-ink', text: 'Checking…' },
}

function StatusPill({ status }) {
  const { pill, text } = STATUS_STYLE[status]
  return (
    <span className={`flex items-center gap-1 rounded-full border-2 border-level-tile-edge px-2.5 py-px text-sm font-black ${pill}`}>
      {status === 'PASS' && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 13 4 4L19 7" />
        </svg>
      )}
      {status === 'FAIL' && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )}
      {text}
    </span>
  )
}

function CheckTile({ icon, label, status }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-[20px] border-[3px] border-level-tile-edge px-2 py-3 shadow-level-tile ${STATUS_STYLE[status].card}`}>
      <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-level-tile-edge bg-white text-level-ink">
        {icon}
      </span>
      <p className="text-center text-base font-black text-ink">{label}</p>
      <StatusPill status={status} />
    </div>
  )
}

export default function QualityCheckScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const devicesReady = location.state?.devicesReady === true
  // The GO1 video checks need the <video> element as a reactive dependency, so
  // we keep it in state (a ref mutation wouldn't re-run them). A parallel ref to
  // the same node lets the effect attach the stream by mutating the DOM element.
  const videoRef = useRef(null)
  const [videoEl, setVideoEl] = useState(null)
  const setVideoNode = useCallback((node) => {
    videoRef.current = node
    setVideoEl(node)
  }, [])
  const platform = useMemo(() => detectPlatform(), [])
  const { stream, audioTrack, permissionStatus, errorKind, requestStream, retry } = useMediaStream()

  const { allPassed, checks } = useQualityGate({ audioTrack, videoElement: videoEl })

  // Camera + mic are turned on in /pre-session ("Before we start!"), not here.
  // Arriving from there, the learner already tapped Allow, so re-acquire
  // without a button (needed where the Permissions API can't confirm the grant,
  // e.g. Firefox/Safari). Arriving any other way → send them to the explainer.
  useEffect(() => {
    if (permissionStatus !== 'pending') return
    if (devicesReady) requestStream()
    else navigate('/pre-session', { replace: true })
  }, [permissionStatus, devicesReady, requestStream, navigate])

  // Attach the stream to the video element once both exist.
  useEffect(() => {
    if (!videoEl || !stream) return
    videoRef.current.srcObject = stream
    videoRef.current.play().catch(() => {})
  }, [videoEl, stream])

  // Acquisition failed (denied / device in use / unplugged) → recovery steps.
  if (permissionStatus === 'denied') {
    return <PermissionDenied platform={platform} errorKind={errorKind} onRetry={retry} />
  }

  function handleRecord() {
    if (!allPassed) return
    // /pre-session already set rr_onboarding_seen, so re-reading it here would
    // always say "not first" — forward the value it captured instead.
    navigate('/session', { state: { isFirstSession: location.state?.isFirstSession ?? false } })
  }

  // Tip = the first failing check's own message (specific: e.g. "too loud" vs
  // "too dark"); while the mic is still listening, nudge the learner to speak.
  const failing = CHECK_ROWS.find(({ key }) => checks[key].status === 'FAIL')
  const tip = failing
    ? checks[failing.key].message
    : checks.mic.status === 'CHECKING'
      ? 'Say "Hi!" nice and loud'
      : null
  const facePassed = checks.camera.status === 'PASS'

  return (
    <div className="min-h-dvh bg-level-card font-display text-ink sm:bg-divider sm:py-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-level-card px-4.5 pb-7 sm:min-h-0 sm:rounded-[32px] sm:border-[3px] sm:border-level-edge">
        {/* Header: exit · logo (empty third column keeps the logo centred) */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <StickerExitButton onClick={() => navigate('/dashboard')} />
          <div className="flex items-center gap-1.5">
            <span className="flex -translate-y-0.5"><LogoMark size={32} /></span>
            <span className="text-xl font-black text-level-ink">ReadRight</span>
          </div>
          <span />
        </header>

        <h1 className="mt-3 text-center text-[32px] font-black leading-tight text-level-ink">Get ready!</h1>
        <p className="mb-4 text-center text-[17px] font-bold text-coral-ink">
          Let&apos;s check 4 quick things
        </p>

        {/* Camera preview + face guide */}
        <div className="relative h-[250px] overflow-hidden rounded-3xl border-[3px] border-level-tile-edge bg-gradient-to-br from-[#4a3530] to-[#7a625b] shadow-level-tile">
          {permissionStatus === 'granted' ? (
            <video
              ref={setVideoNode}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            />
          ) : (
            <p className="flex h-full items-center justify-center text-base font-semibold text-white/80">
              Getting your camera ready…
            </p>
          )}
          {stream && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-0.5 text-sm font-black text-white">
              <span aria-hidden="true" className="size-2 rounded-full bg-coral" />
              Live
            </span>
          )}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 top-[44%] h-[180px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-dashed ${
              facePassed ? 'border-mint-light' : 'border-white/85'
            }`}
          />
          <div className="absolute inset-x-3 bottom-3 flex justify-center">
            <span className="rounded-full border-2 border-level-tile-edge bg-white px-3.5 py-1 text-sm font-black text-level-ink">
              Put your face in the circle
            </span>
          </div>
        </div>

        {/* GO1 checks — 2×2 grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {CHECK_ROWS.map(({ key, label }) => (
            <CheckTile key={key} icon={ICONS[key]} label={label} status={checks[key].status} />
          ))}
        </div>

        {tip && (
          <div role="status" className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-level-tile-edge bg-shelf-card px-3.5 py-3">
            <LogoMark size={32} />
            <p className="text-[15px] font-bold text-level-ink">{tip}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleRecord}
          disabled={!allPassed}
          className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-[3px] px-4 font-black ${
            allPassed
              ? 'border-level-tile-edge bg-level-pill text-xl text-white shadow-level-tile active:translate-y-1 active:shadow-none'
              : 'cursor-not-allowed border-level-edge bg-sticker text-lg text-level-muted'
          }`}
        >
          {allPassed ? (
            <>
              <span aria-hidden="true" className="size-3.5 rounded-full bg-white" />
              Start reading!
            </>
          ) : (
            'Almost ready…'
          )}
        </button>
      </div>
    </div>
  )
}
