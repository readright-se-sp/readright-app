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
import { PermissionExplainer } from '../components/quality/PermissionExplainer'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import ExitButton from '../components/ui/ExitButton'
import { LogoMark } from '../components/icons'

const MAX_RECORDING_MS = 5 * 60 * 1000
const STEPS = ['Uploading', 'Transcribing', 'Scoring', 'Done']

function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionScreen() {
  // Passages come from Supabase (single source of truth) — fetched + randomly
  // picked by usePassage. May still be loading when the camera is granted; the
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

  // Keep the processing screen up while the analysis is in flight AND until we
  // navigate away on success — avoids a flash of the record screen in between.
  const isProcessing = status === 'submitting' || status === 'success'

  // Cosmetic step indicator, scoped to the in-flight submit. setState happens
  // only inside the timer callback (async — never synchronously in the effect
  // body); the step is reset in handleStop before submit starts. The effect
  // cleanup clears the timer when the status leaves 'submitting'.
  useEffect(() => {
    if (status !== 'submitting') return
    let step = 0
    const stepTimer = setInterval(() => {
      step += 1
      if (step < STEPS.length - 1) setProcessingStep(step)
    }, 800)
    return () => clearInterval(stepTimer)
  }, [status])

  // On success, hold the processing screen briefly (the "Done" step is shown via
  // displayStep below), then navigate to results.
  useEffect(() => {
    if (status !== 'success' || !result) return
    const t = setTimeout(
      () => navigate('/results', { state: { result, passage, isFirstSession } }),
      400,
    )
    return () => clearTimeout(t)
  }, [status, result, navigate, passage, isFirstSession])

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
    submit(file, passage.id)
  }

  // Bail out of the session back to the dashboard. If a take is in progress,
  // claim it (so the stop/monitor effects don't submit) and stop the recorder to
  // discard it; unmounting then lets useMediaStream release the camera/mic.
  function handleCancel() {
    stopReasonRef.current = true
    if (isRecording) stop().catch(() => {})
    navigate('/dashboard')
  }

  function handleStart() {
    if (!passage) return // nothing to read yet — the button is disabled too
    reset() // clear any prior error/timeout before a fresh take
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

  // --- Processing screen -----------------------------------------------------
  if (isProcessing) {
    // On success, show every step done (the brief "Done" flash before navigation).
    const displayStep = status === 'success' ? STEPS.length - 1 : processingStep
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
        <Header />
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
          {/* Top reassurance banner */}
          <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-soft text-[12px] font-bold text-white" aria-hidden="true">
              i
            </span>
            <p className="text-[14px] leading-[20px] text-ink-soft">
              Still working — this can take up to 2 minutes. Please don't close the app.
            </p>
          </div>

          {/* Center: heading + step progress */}
          <div className="flex flex-1 flex-col justify-center py-8">
            <h2 className="text-center text-[24px] font-extrabold text-ink">
              Analyzing your reading…
            </h2>
            <p className="mt-2 text-center text-[16px] leading-[24px] text-ink-soft">
              This usually takes less than a minute. Please wait.
            </p>

            {/* Stepper — circles joined by connectors; state by icon + colour */}
            <ol className="mt-8 flex w-full items-start" aria-live="polite">
              {STEPS.map((label, i) => {
                const done = i < displayStep
                const active = i === displayStep
                const last = i === STEPS.length - 1
                return (
                  <li key={label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-center">
                      <span className={`h-[3px] flex-1 rounded-full ${i === 0 ? 'opacity-0' : done || active ? 'bg-goal' : 'bg-card-border'}`} />
                      {done ? (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-goal text-[14px] font-bold text-white">
                          ✓
                        </span>
                      ) : active ? (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-brand bg-white">
                          <span className="size-2.5 rounded-full bg-brand" />
                        </span>
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card-border">
                          <span className="size-2 rounded-full bg-white/70" />
                        </span>
                      )}
                      <span className={`h-[3px] flex-1 rounded-full ${last ? 'opacity-0' : done ? 'bg-goal' : 'bg-card-border'}`} />
                    </div>
                    <span
                      className={`text-center text-[11px] font-bold uppercase tracking-[0.04em] ${
                        active ? 'text-brand' : done ? 'text-goal' : 'text-ink-muted'
                      }`}
                    >
                      {label}{last ? '!' : ''}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Bottom warning banner + footer */}
          <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white" aria-hidden="true">
              i
            </span>
            <p className="text-[14px] leading-[20px] text-ink">
              Do not close this screen while your reading is being analyzed.
            </p>
          </div>

          <p className="mt-4 text-center text-[12px] text-ink-muted">
            Powered by Phil-IRI Assessment Engine
          </p>
        </div>
      </div>
    )
  }

  // --- Granted: "Read out loud" ----------------------------------------------
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f3e6e3] px-4 py-6 font-display">
      <div className="flex w-full max-w-[380px] flex-col rounded-[28px] border-2 border-card-border bg-[#fffdfc] px-4 pt-4 pb-5 shadow-[0px_18px_40px_0px_rgba(120,60,50,0.12)]">
        {/* Header: exit · logo · spacer */}
        <div className="flex items-center justify-between">
          <ExitButton onClick={handleCancel} className="bg-divider text-ink-soft" />
          <div className="flex items-center gap-1.5">
            <img src="/mascot-reading.svg" alt="" className="size-[34px] object-contain" />
            <span className="text-[18px] font-black text-brand">ReadRight</span>
          </div>
          <div className="w-11" aria-hidden="true" />
        </div>

        {/* Camera: one <video> throughout (it also feeds the live GO1 monitor),
            restyled from a large framing preview into a small corner bubble while
            recording so the learner's eyes stay on the passage. */}
        <div className={`mt-3 flex items-center gap-3 ${isRecording ? 'min-h-[104px] justify-between' : ''}`}>
          {isRecording && (
            <RecordingStatus elapsed={formatElapsed(elapsed)} problem={recordingProblem} />
          )}
          <div
            className={`relative flex-none transition-all duration-300 ${
              isRecording ? (recordingProblem ? 'size-[104px]' : 'size-[84px]') : 'h-[210px] w-full'
            }`}
          >
            <div
              className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-[#4a3530] to-[#7a625b] ${
                isRecording
                  ? `rounded-full border-4 ${recordingProblem ? 'border-amber animate-attention-pulse' : 'border-mint'}`
                  : 'rounded-[24px]'
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
                      faceReady ? 'border-solid border-mint' : 'border-dashed border-white/85'
                    }`}
                  />
                  {/* Colour + icon + words (never colour alone). */}
                  <div className="absolute inset-x-3 bottom-3 flex justify-center" aria-live="polite">
                    {faceReady ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-mint-ink px-3.5 py-1.5 text-sm font-extrabold text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                        Great! You're ready to read
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#fffdfc]/95 px-3.5 py-1.5 text-sm font-extrabold text-ink">
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
                className={`absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-[3px] border-[#fffdfc] text-sm font-black text-white ${
                  recordingProblem ? 'bg-amber' : 'bg-mint'
                }`}
              >
                {recordingProblem ? '!' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Passage */}
        <div className="mt-3 rounded-[22px] border-2 border-card-border bg-[#fffdfc] px-4.5 pt-4.5 pb-5">
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.96px] text-ink-muted">
              Read out loud
            </p>
            <span className="rounded-full bg-mint-soft px-2.5 py-1 text-sm font-extrabold text-mint-ink">
              Easy
            </span>
          </div>
          {/* TODO(passage title): placeholder until fetchPassages selects a
              `title` column from the `passages` table; then this shows it. */}
          <h2 className="mt-1 mb-2.5 text-[22px] font-black leading-tight text-ink">
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
                className="min-h-[44px] self-start rounded-full bg-brand px-6 py-2 text-[15px] font-bold text-white"
              >
                Try Again
              </button>
            </div>
          ) : passage ? (
            <p className="text-[18px] font-semibold leading-[1.7] text-ink">{passage.text}</p>
          ) : (
            <p className="text-base leading-[24px] text-ink-muted" aria-live="polite">
              Getting your passage ready…
            </p>
          )}
        </div>

        {/* Submit error, or a real-time check failed → the take was discarded. */}
        {(errorMessage || (!isRecording && qualityFailure)) && (
          <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-[18px] bg-coral-soft px-3.5 py-3">
            <span
              aria-hidden="true"
              className="flex size-7 flex-none items-center justify-center rounded-full bg-coral text-base font-black text-white"
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
            className="mt-4.5 flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-[2.5px] border-brand bg-[#fffdfc] py-4 text-[20px] font-extrabold text-brand shadow-[0px_5px_0px_#e6cfca] active:translate-y-1 active:shadow-[0px_1px_0px_#e6cfca]"
          >
            <span className="size-3.5 rounded-[3px] bg-brand" aria-hidden="true" />
            I&apos;m done!
          </button>
        ) : (
          <>
            <p className="mt-3.5 text-center text-[15px] font-bold text-ink-soft">
              Read clearly, at your own pace
            </p>
            <button
              type="button"
              onClick={handleStart}
              disabled={!passage}
              className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full py-4 text-[20px] font-extrabold ${
                passage
                  ? 'bg-brand text-white shadow-[0px_5px_0px_#7a1f1a] active:translate-y-1 active:shadow-[0px_1px_0px_#7a1f1a]'
                  : 'cursor-not-allowed bg-[#e6d3ce] text-ink-muted'
              }`}
            >
              <span className={`size-3.5 rounded-full ${passage ? 'bg-white' : 'bg-ink-muted'}`} aria-hidden="true" />
              {qualityFailure ? 'Try again' : 'Start reading'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Quiet placeholder shown while useMediaStream probes/silently acquires an
// already-granted stream. Intentionally minimal so the pre-granted path feels
// like a direct transition rather than a loading screen.
function Preparing() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
      <Header label="READING SESSION" />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-10">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-card text-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" aria-hidden="true">
            <path d="m23 7-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <p className="text-center text-[16px] font-semibold text-ink-soft" aria-live="polite">
          Preparing camera…
        </p>
      </div>
    </div>
  )
}

function Header({ label, onCancel }) {
  return (
    <header className="bg-header">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {onCancel && <ExitButton onClick={onCancel} className="-ml-2" />}
          <LogoMark />
          <span className="text-[20px] font-extrabold text-brand">ReadRight</span>
        </div>
        {label && (
          <span className="text-[11px] font-bold tracking-[0.12em] text-ink-muted">{label}</span>
        )}
      </div>
    </header>
  )
}