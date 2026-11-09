// QualityCheckScreen.jsx — "Get ready!" GO1 gate (/quality-check).
// Live camera preview + the four quality checks as a 2×2 grid. Camera + mic
// are turned on in /pre-session; this screen only re-acquires and checks.
// Sticker style like /dashboard: soft cards with a same-colour ledge, on the same
// white sky card as /pre-session (SkyCardPage). The camera takes the spare height.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import { useQualityGate } from '../hooks/useQualityGate'
import { detectPlatform } from '../utils/platform'
import { LiveBadge } from '../components/quality/CameraPreview'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import { SkyCardPage } from '../components/ui/SkyCardPage'
import { CAMERA_BOX, SKY_CARD_TALL, SOFT_PRIMARY } from '../components/ui/stickerStyles'
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
  PASS: { card: 'bg-result-green shadow-ledge-green', pill: 'bg-goal text-white', text: 'Good!' },
  FAIL: { card: 'bg-result-pink shadow-ledge-pink', pill: 'bg-brand text-white', text: 'Fix me' },
  CHECKING: { card: 'bg-shelf-card shadow-ledge-yellow', pill: 'bg-cta text-level-ink', text: 'Checking…' },
}

function StatusPill({ status }) {
  const { pill, text } = STATUS_STYLE[status]
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-black ${pill}`}>
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
    <div className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-1.5 py-1.5 tall:gap-1.5 tall:py-3 ${STATUS_STYLE[status].card}`}>
      <span className="flex size-8 items-center justify-center rounded-full bg-white text-level-ink tall:size-10">
        {icon}
      </span>
      <p className="text-center text-base font-black leading-tight text-ink">{label}</p>
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
  // The camera's real shape, so from sm: its box matches with no empty bands.
  const [videoRatio, setVideoRatio] = useState(16 / 9)
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

  function handleVideoSize({ target: { videoWidth, videoHeight } }) {
    if (videoWidth && videoHeight) setVideoRatio(videoWidth / videoHeight)
  }

  function handleRecord() {
    if (!allPassed) return
    // /pre-session already set rr_onboarding_seen, so re-reading it here would
    // always say "not first" — forward the value it captured instead.
    navigate('/session', { state: { isFirstSession: location.state?.isFirstSession ?? false, passageGrade: location.state?.passageGrade } })
  }

  // Tip = the first failing check's own message (specific: e.g. "too loud" vs
  // "too dark"); while the mic is still listening, nudge the learner to speak.
  const failing = CHECK_ROWS.find(({ key }) => checks[key].status === 'FAIL')
  const tip = failing
    ? checks[failing.key].message
    : checks.mic.status === 'CHECKING'
      ? 'Say "Hi!" nice and loud'
      : null
  // Always a line here, so the camera doesn't jump as the checks change.
  const note = tip ?? (allPassed ? "You're all set!" : 'Looking good! Hold still…')
  const facePassed = checks.camera.status === 'PASS'
  // A PASS can also mean face detection couldn't load, so this praises without
  // claiming we saw the face; "good to go" waits for all four checks.
  const faceLabel = !facePassed
    ? 'Put your face in the circle'
    : allPassed
      ? "You're good to go!"
      : 'Great! Stay right there'

  return (
    <SkyCardPage
      title="Get ready!"
      lumi={false}
      onExit={() => navigate('/dashboard')}
      className={SKY_CARD_TALL}
    >
      {/* Camera preview + face guide */}
      {/* From sm: the box takes the camera's shape, as big as the spare height allows. */}
      <div className="relative mt-3 min-h-[140px] flex-1 tall:mt-4">
        <div className="absolute inset-0 flex items-center justify-center @container-size">
          <div
            style={{ '--video-ratio': videoRatio }}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a3530] to-[#7a625b] ${CAMERA_BOX}`}
          >
            {permissionStatus === 'granted' ? (
              <video
                ref={setVideoNode}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={handleVideoSize}
                onResize={handleVideoSize}
                className="absolute inset-0 h-full w-full -scale-x-100 object-contain sm:object-cover"
              />
            ) : (
              <p className="flex h-full items-center justify-center text-base font-semibold text-white/80">
                Getting your camera ready…
              </p>
            )}
            {stream && <LiveBadge />}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-1/2 top-[44%] aspect-[7/9] h-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 ${
                facePassed ? 'border-solid border-score-green' : 'border-dashed border-white/85'
              }`}
            />
            <div className="absolute inset-x-3 bottom-3 flex justify-center">
              <span className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-black ${facePassed ? 'bg-goal text-white' : 'bg-white text-level-ink'}`}>
                {facePassed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
                {faceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GO1 checks — 2×2 grid */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 tall:mt-5 tall:gap-3.5">
        {CHECK_ROWS.map(({ key, label }) => (
          <CheckTile key={key} icon={ICONS[key]} label={label} status={checks[key].status} />
        ))}
      </div>

      <div className="mt-3.5 flex flex-col gap-3.5 tall:mt-5 tall:gap-5">
        <div role="status" className="flex min-h-14 items-center gap-2.5 rounded-2xl bg-shelf-card px-3 py-1.5 shadow-ledge-yellow tall:py-2.5">
          <LogoMark size={28} />
          <p className="text-[15px] font-bold leading-tight text-level-ink">{note}</p>
        </div>

        <button
          type="button"
          onClick={handleRecord}
          disabled={!allPassed}
          className={`min-h-14 gap-2.5 px-4 ${
            allPassed
              ? `${SOFT_PRIMARY} text-xl`
              : 'flex w-full cursor-not-allowed items-center justify-center rounded-2xl border-[3px] border-cream-edge bg-cream-button text-lg font-black text-level-muted shadow-cream-button'
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
    </SkyCardPage>
  )
}
