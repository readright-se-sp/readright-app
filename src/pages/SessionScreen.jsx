// SessionScreen.jsx — GO1 entry: permission gate → live preview → recording.
//
// Stream ownership (see ARCHITECTURE.md):
//   useMediaStream  — acquires & owns the combined audio+video stream (the only
//                     getUserMedia caller, the only track.stop() caller).
//   useMediaRecorder — records that stream into an MP4/WebM File. It never calls
//                     getUserMedia and never stops tracks, so the preview keeps
//                     running after a recording stops.
//
// This page renders one of these states based on permissionStatus:
//   checking           → neutral "Preparing camera…" placeholder while the hook
//                        probes existing permission (and silently acquires the
//                        stream if camera+mic were already granted)
//   pending/requesting → PermissionExplainer (in-app explanation before the
//                        native browser prompt)
//   denied             → PermissionDenied (device-specific recovery steps)
//   granted            → "Read out loud": passage + live camera (a large preview
//                        before recording, shrinking to a corner bubble while
//                        recording) + Start reading / I'm done, then the
//                        processing screen while results are computed.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePassage } from '../hooks/usePassage'
import { useMediaStream } from '../hooks/useMediaStream'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useAnalyzeSubmit } from '../hooks/useAnalyzeSubmit'
import { useRecordingMonitor } from '../hooks/useRecordingMonitor'
import { useCameraCheck } from '../hooks/useCameraCheck'
import { detectPlatform } from '../utils/platform'
import { CameraPreview } from '../components/quality/CameraPreview'
import { RecordingStatus } from '../components/session/RecordingStatus'
import { ProcessingScreen } from '../components/session/ProcessingScreen'
import { ComprehensionQuiz } from '../components/quiz/ComprehensionQuiz'
import { LeaveSessionDialog } from '../components/session/LeaveSessionDialog'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { PermissionExplainer } from '../components/quality/PermissionExplainer'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import { StickerExitButton } from '../components/ui/ExitButton'
import { StickerPage } from '../components/ui/StickerPage'
import { LogoMark } from '../components/icons'

const MAX_RECORDING_MS = 5 * 60 * 1000
// ProcessingScreen stages: 0 sending · 1 listening · 2 checking · 3 almost done ·
// 4 finished. The timer walks 0→2 while the analysis runs; 4 shows on success.
const LAST_RUNNING_STEP = 2
const FINISHED_STEP = 4
// The processing screen stays up at least this long after the quiz, even when
// the result is already in (static samples return instantly).
const MIN_ANALYZING_MS = 5000

function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionScreen() {
  // Passages are static samples for now (see usePassage), randomly picked by
  // usePassage. May still be loading when the camera is granted; the
  // preview/GO1 checks must never be blocked on it (CLAUDE.md), only the
  // passage card and the Start button wait for content.
  const { passage, error: passageError, retry: retryPassage } = usePassage()
  const platform = useMemo(() => detectPlatform(), [])
  const navigate = useNavigate()
  const { state: routeState } = useLocation()
  const isFirstSession = routeState?.isFirstSession ?? false

  const { stream, audioTrack, permissionStatus, errorKind, requestStream, retry } = useMediaStream()
  const { recordingState, elapsed, start, stop } = useMediaRecorder(stream, {
    maxDurationMs: MAX_RECORDING_MS,
  })
  // useAnalyzeSubmit owns the FastAPI POST: AbortController, 120s timeout, and
  // the idle/submitting/success/error/timeout state machine (see ARCHITECTURE.md).
  const { status, result, submit, reset } = useAnalyzeSubmit()

  const isRecording = recordingState === 'recording'

  // The live <video> from CameraPreview, kept in state so the monitor's check
  // hooks re-run when it mounts. Memoize the callback ref or it thrashes the node
  // and re-inits MediaPipe every render.
  const [videoEl, setVideoEl] = useState(null)
  const setVideoNode = useCallback((node) => setVideoEl(node), [])

  // Real-time GO1 monitoring — runs only while recording (active gates the checks).
  const monitor = useRecordingMonitor({ audioTrack, videoElement: videoEl, active: isRecording })
  // Framing feedback on the large preview before a take: the oval turns green
  // once the face is in place. Gated off while recording (the monitor runs its
  // own camera check then) so only one MediaPipe instance is ever live.
  const framing = useCameraCheck(isRecording ? null : videoEl)
  const faceReady = !isRecording && framing.status === 'PASS'
  // Reason captured from the monitor so it survives the recording stopping (which
  // clears monitor.failure). stopReasonRef makes a quality stop claim the take once.
  const [qualityFailure, setQualityFailure] = useState(null)
  const stopReasonRef = useRef(false)

  const [processingStep, setProcessingStep] = useState(0)

  // Comprehension quiz: shown right after "I'm done!" while the analysis runs in
  // the background (this page must stay mounted, or useAnalyzeSubmit aborts the
  // request). Results open only once the learner finishes the quiz.
  // All-or-nothing by design: leaving /session before results (exit, back, close)
  // aborts the analysis and drops the quiz answers, and nothing is saved — the
  // session is only stored once /results opens. Keep the quiz inside /session.
  const { user } = useCurrentUser()
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState(null)
  // True for MIN_ANALYZING_MS after the quiz; holds back the finish and navigation.
  const [analyzingHold, setAnalyzingHold] = useState(false)
  // "Stop reading now?" — only asked when leaving would discard work.
  const [confirmLeave, setConfirmLeave] = useState(false)

  // After the quiz, keep the processing screen up while the analysis is still in
  // flight AND until we navigate away on success — avoids a flash of the record
  // screen in between. If the analysis failed, the record screen shows the error.
  const isProcessing = status === 'submitting' || status === 'success'

  // Cosmetic step indicator, scoped to the in-flight submit. setState happens
  // only inside the timer callback (async — never synchronously in the effect
  // body); the step is reset in handleStop before submit starts. The effect
  // cleanup clears the timer when the analysis and the post-quiz hold are over.
  const stepsRunning = status === 'submitting' || analyzingHold
  useEffect(() => {
    if (!stepsRunning) return
    let step = 0
    const stepTimer = setInterval(() => {
      step += 1
      if (step <= LAST_RUNNING_STEP) setProcessingStep(step)
    }, 1700)
    return () => clearInterval(stepTimer)
  }, [stepsRunning])

  useEffect(() => {
    if (!analyzingHold) return
    const t = setTimeout(() => setAnalyzingHold(false), MIN_ANALYZING_MS)
    return () => clearTimeout(t)
  }, [analyzingHold])

  // On success, hold the processing screen briefly so the "Great job reading!"
  // finish is seen (displayStep below), then navigate to results.
  useEffect(() => {
    if (status !== 'success' || !result || quizOpen || analyzingHold) return
    const t = setTimeout(
      () => navigate('/results', { state: { result, passage, isFirstSession, quizAnswers } }),
      1200,
    )
    return () => clearTimeout(t)
  }, [status, result, quizOpen, analyzingHold, navigate, passage, isFirstSession, quizAnswers])

  // Real-time quality failure: capture the reason BEFORE stopping (stopping flips
  // isRecording false, which makes the monitor clear its own failure), then stop
  // and DISCARD the take — never submit a recording we already know is unusable.
  useEffect(() => {
    if (!monitor.failure || !isRecording || stopReasonRef.current) return
    stopReasonRef.current = true
    setQualityFailure(monitor.failure)
    stop().catch(() => {})
  }, [monitor.failure, isRecording, stop])

  async function handleStop() {
    if (stopReasonRef.current) return // a quality failure already claimed this take
    stopReasonRef.current = true
    const file = await stop()
    if (!file) return
    setProcessingStep(0)
    setQuizAnswers(null)
    setQuizOpen(true)
    submit(file, passage.id)
  }

  function handleQuizFinish(answers) {
    setQuizAnswers(answers)
    setQuizOpen(false)
    setAnalyzingHold(true)
  }

  // Bail out of the session back to the dashboard. If a take is in progress,
  // claim it (so the stop/monitor effects don't submit) and stop the recorder to
  // discard it; unmounting then lets useMediaStream release the camera/mic.
  function handleCancel() {
    stopReasonRef.current = true
    if (isRecording) stop().catch(() => {})
    navigate('/dashboard')
  }

  // ✕ while recording or during the quiz asks first (the reading would be lost);
  // before a take there's nothing to lose, so it leaves straight away.
  function requestExit() {
    if (isRecording || quizOpen) setConfirmLeave(true)
    else handleCancel()
  }

  const leaveDialog = confirmLeave && (
    <LeaveSessionDialog onStay={() => setConfirmLeave(false)} onLeave={handleCancel} />
  )

  function handleStart() {
    if (!passage) return // nothing to read yet — the button is disabled too
    reset() // clear any prior error/timeout before a fresh take
    setAnalyzingHold(false)
    setQualityFailure(null)
    monitor.clearFailure() // drop the monitor's stale failure so it can't re-fire
    stopReasonRef.current = false
    start()
  }

  // Specific, recovery-oriented copy per failure kind (CLAUDE.md error rules) —
  // never a generic "something went wrong".
  const errorMessage =
    status === 'timeout'
      ? 'This is taking longer than usual. Please check your internet, then tap Start reading to try again.'
      : status === 'error'
        ? "We couldn't check your reading this time. Please tap Start reading to try again."
        : null

  // While recording, the first failing live check becomes a short tip beside the
  // camera bubble (and turns the bubble amber). Camera framing gets the design's
  // kid-friendly wording; the others reuse their hook's specific message.
  const failingKey = isRecording
    ? ['camera', 'lighting', 'mic', 'noise'].find((k) => monitor.checks[k]?.status === 'FAIL')
    : null
  const recordingProblem = failingKey
    ? failingKey === 'camera'
      ? 'Move back into the circle'
      : monitor.checks[failingKey].message
    : null

  // --- Permission gate -------------------------------------------------------
  // While probing existing permission (and silently acquiring when pre-granted),
  // show a quiet placeholder — never the explainer — so the pre-granted path
  // reads as an instant jump to the recording view.
  if (permissionStatus === 'checking') {
    return <Preparing />
  }

  if (permissionStatus === 'pending' || permissionStatus === 'requesting') {
    return (
      <PermissionExplainer
        onAllow={requestStream}
        requesting={permissionStatus === 'requesting'}
      />
    )
  }

  if (permissionStatus === 'denied') {
    return <PermissionDenied platform={platform} errorKind={errorKind} onRetry={retry} />
  }

  // --- Comprehension quiz (analysis keeps running underneath) -----------------
  if (quizOpen) {
    return (
      <>
        <ComprehensionQuiz
          passage={passage}
          grade={user?.user_metadata?.grade_level}
          onFinish={handleQuizFinish}
          onExit={requestExit}
        />
        {leaveDialog}
      </>
    )
  }

  // --- Processing screen -----------------------------------------------------
  if (isProcessing) {
    // On success, show every step done (the brief "Done" flash before navigation).
    const displayStep = status === 'success' && !analyzingHold ? FINISHED_STEP : processingStep
    return <ProcessingScreen step={displayStep} />
  }

  // --- Granted: "Read out loud" ----------------------------------------------
  return (
    <StickerPage>
      <SessionHeader onExit={requestExit} />

      {/* Camera: one <video> throughout (it also feeds the live GO1 monitor),
          restyled from a large framing preview into a small corner bubble while
          recording so the learner's eyes stay on the passage. */}
      <div className={`mt-4 flex items-center gap-3 ${isRecording ? 'min-h-[104px] justify-between' : ''}`}>
        {isRecording && (
          <RecordingStatus elapsed={formatElapsed(elapsed)} problem={recordingProblem} />
        )}
        <div
          className={`relative flex-none transition-all duration-300 ${
            isRecording ? (recordingProblem ? 'size-[104px]' : 'size-[84px]') : 'h-[210px] w-full'
          }`}
        >
          <div
            className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-[#4a3530] to-[#7a625b] shadow-level-tile ${
              isRecording
                ? `rounded-full border-4 ${recordingProblem ? 'border-amber animate-attention-pulse' : 'border-mint'}`
                : 'rounded-3xl border-[3px] border-level-tile-edge'
            }`}
          >
            <CameraPreview
              stream={stream}
              onVideoNode={setVideoNode}
              className="absolute inset-0 h-full w-full object-cover -scale-x-100"
            />
            {!isRecording && (
              <>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-[46%] h-[150px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 transition-colors duration-300 ${
                    faceReady ? 'border-solid border-mint-light/60' : 'border-dashed border-white/50'
                  }`}
                />
                {/* Colour + icon + words (never colour alone). */}
                <div className="absolute inset-x-3 bottom-3 flex justify-center" aria-live="polite">
                  {faceReady ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-goal px-3.5 py-1 text-sm font-black text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                      Great! You're ready to read
                    </span>
                  ) : (
                    <span className="rounded-full border-2 border-level-tile-edge bg-white px-3.5 py-1 text-sm font-black text-level-ink">
                      Keep your face in the circle
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {isRecording && (
            <span
              aria-hidden="true"
              className={`absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-[3px] border-level-tile-edge text-sm font-black ${
                recordingProblem ? 'bg-cta text-level-ink' : 'bg-mint text-white'
              }`}
            >
              {recordingProblem ? '!' : '✓'}
            </span>
          )}
        </div>
      </div>

      {/* Passage */}
      <div className="mt-4 rounded-3xl border-[3px] border-level-tile-edge bg-sticker px-4.5 pt-4 pb-5 shadow-level-tile">
        <div className="flex items-center justify-between gap-2.5">
          <p className="rounded-full bg-level-pill px-3 py-0.5 text-sm font-black uppercase tracking-[0.06em] text-white">
            Read out loud
          </p>
          <span className="rounded-full border-2 border-level-tile-edge bg-result-green px-2.5 py-px text-sm font-black text-goal">
            Easy
          </span>
        </div>
        {/* TODO(passage title): placeholder until the backend passage data
            includes a title; then this shows it. */}
        <h2 className="mt-2.5 mb-2.5 text-[24px] font-black leading-tight text-level-ink">
          {passage?.title ?? "Today's Story"}
        </h2>
        {passageError ? (
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-base leading-[24px] text-ink">
              We couldn't load your reading passage. Please check your internet, then tap Try Again.
            </p>
            <button
              type="button"
              onClick={retryPassage}
              className="min-h-12 self-start rounded-2xl border-[3px] border-level-tile-edge bg-level-pill px-6 text-lg font-black text-white shadow-level-tile active:translate-y-1 active:shadow-none"
            >
              Try Again
            </button>
          </div>
        ) : passage ? (
          <p className="text-[19px] font-semibold leading-[1.7] text-ink">{passage.text}</p>
        ) : (
          <p className="text-base leading-[24px] text-level-muted" aria-live="polite">
            Getting your passage ready…
          </p>
        )}
      </div>

      {/* Submit error, or a real-time check failed → the take was discarded. */}
      {(errorMessage || (!isRecording && qualityFailure)) && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border-[3px] border-level-tile-edge bg-result-pink px-3.5 py-3">
          <span
            aria-hidden="true"
            className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-level-tile-edge bg-brand text-base font-black text-white"
          >
            !
          </span>
          <p className="text-[15px] font-bold text-ink">
            {errorMessage ?? `${qualityFailure.message} Let's try that again.`}
          </p>
        </div>
      )}

      {isRecording ? (
        <button
          type="button"
          onClick={handleStop}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-[3px] border-level-tile-edge bg-white px-4 text-xl font-black text-level-ink shadow-level-tile active:translate-y-1 active:shadow-none"
        >
          <span className="size-3.5 rounded-[3px] bg-level-pill" aria-hidden="true" />
          I&apos;m done!
        </button>
      ) : (
        <>
          <p className="mt-4 text-center text-[15px] font-bold text-level-muted">
            Read clearly, at your own pace
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={!passage}
            className={`mt-3 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-[3px] px-4 text-xl font-black ${
              passage
                ? 'border-level-tile-edge bg-level-pill text-white shadow-level-tile active:translate-y-1 active:shadow-none'
                : 'cursor-not-allowed border-level-edge bg-sticker text-level-muted'
            }`}
          >
            <span className={`size-3.5 rounded-full ${passage ? 'bg-white' : 'bg-level-edge'}`} aria-hidden="true" />
            {qualityFailure ? 'Try again' : 'Start reading'}
          </button>
        </>
      )}
      {leaveDialog}
    </StickerPage>
  )
}

/** Exit · logo (empty third column keeps the logo centred). `onExit` is left out while preparing. */
function SessionHeader({ onExit }) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-[max(1rem,env(safe-area-inset-top))]">
      {onExit ? <StickerExitButton onClick={onExit} /> : <span />}
      <div className="flex items-center gap-1.5">
        <span className="flex -translate-y-0.5"><LogoMark size={32} /></span>
        <span className="text-xl font-black text-level-ink">ReadRight</span>
      </div>
      <span />
    </header>
  )
}

// Quiet placeholder shown while useMediaStream probes/silently acquires an
// already-granted stream. Intentionally minimal so the pre-granted path feels
// like a direct transition rather than a loading screen.
function Preparing() {
  return (
    <StickerPage>
      <SessionHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-10">
        <img src="/mascot-reading.svg" alt="" className="w-24 motion-safe:animate-lumi-bob" />
        <p className="text-center text-lg font-bold text-level-muted" aria-live="polite">
          Preparing camera…
        </p>
      </div>
    </StickerPage>
  )
}
