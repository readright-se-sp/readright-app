// QualityCheckScreen.jsx — "Get ready!" GO1 gate (/quality-check).
// Live camera preview + the four quality checks as a 2×2 grid. Camera + mic
// are turned on in /pre-session; this screen only re-acquires and checks.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import { useQualityGate } from '../hooks/useQualityGate'
import { detectPlatform } from '../utils/platform'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import ExitButton from '../components/ui/ExitButton'

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
  PASS: { card: 'bg-mint-soft', pill: 'bg-mint-ink text-white', text: 'Good!' },
  FAIL: { card: 'bg-coral-soft', pill: 'bg-brand text-white', text: 'Fix me' },
  CHECKING: { card: 'bg-peach', pill: 'bg-amber text-ink', text: 'Checking…' },
}

function StatusPill({ status }) {
  const { pill, text } = STATUS_STYLE[status]
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-extrabold ${pill}`}>
      {status === 'PASS' && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 13 4 4L19 7" />
        </svg>
      )}
      {status === 'FAIL' && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )}
      {text}
    </span>
  )
}

function CheckTile({ icon, label, status }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 ${STATUS_STYLE[status].card}`}>
      <span className="flex size-11 items-center justify-center rounded-full bg-[#fffdfc] text-ink-soft">
        {icon}
      </span>
      <p className="text-center text-[15px] font-extrabold text-ink">{label}</p>
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
    <div className="min-h-dvh flex items-center justify-center bg-[#f3e6e3] px-4 py-6 font-display">
      <div className="flex w-full max-w-[380px] flex-col rounded-[28px] border-2 border-card-border bg-[#fffdfc] px-4 pt-4 pb-5 shadow-[0px_18px_40px_0px_rgba(120,60,50,0.12)]">
        {/* Header: exit · logo · spacer */}
        <div className="flex items-center justify-between">
          <ExitButton onClick={() => navigate('/dashboard')} className="bg-divider text-ink-soft" />
          <div className="flex items-center gap-1.5">
            <img src="/mascot-reading.svg" alt="" className="size-[34px] object-contain" />
            <span className="text-[18px] font-black text-brand">ReadRight</span>
          </div>
          <div className="w-11" aria-hidden="true" />
        </div>

        <h1 className="mt-2.5 text-center text-[26px] font-black text-ink">Get ready!</h1>
        <p className="mb-3.5 text-center text-base font-semibold text-ink-soft">
          Let&apos;s check 4 quick things
        </p>

        {/* Camera preview + face guide */}
        <div className="relative h-[250px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#4a3530] to-[#7a625b]">
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
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 top-[44%] h-[180px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 border-dashed ${
              facePassed ? 'border-mint-light' : 'border-white/85'
            }`}
          />
          <div className="absolute inset-x-3 bottom-3 flex justify-center">
            <span className="rounded-full bg-[#fffdfc]/95 px-3.5 py-1.5 text-sm font-extrabold text-ink">
              Put your face in the circle
            </span>
          </div>
        </div>

        {/* GO1 checks — 2×2 grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          {CHECK_ROWS.map(({ key, label }) => (
            <CheckTile key={key} icon={ICONS[key]} label={label} status={checks[key].status} />
          ))}
        </div>

        {tip && (
          <div role="status" className="mt-3 flex items-center gap-2.5 rounded-[18px] bg-peach px-3.5 py-3">
            <span
              aria-hidden="true"
              className="flex size-7 flex-none items-center justify-center rounded-full bg-amber text-base font-black text-white"
            >
              !
            </span>
            <p className="text-[15px] font-bold text-ink">{tip}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleRecord}
          disabled={!allPassed}
          className={`mt-4 flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full py-4 font-extrabold ${
            allPassed
              ? 'bg-brand text-[20px] text-white shadow-[0px_5px_0px_#7a1f1a] active:translate-y-1 active:shadow-[0px_1px_0px_#7a1f1a]'
              : 'cursor-not-allowed bg-[#e6d3ce] text-[18px] text-ink-muted'
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
