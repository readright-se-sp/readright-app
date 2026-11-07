// useRecordingMonitor.js — live GO1 monitoring while a session is recording.
//
// Composes the four GO1 checks (reusing the camera/lighting/noise checks from the
// quality gate, plus the non-latching useMicActivity) and watches for SUSTAINED
// failure: when a check stays FAIL longer than its grace window, it raises a
// `failure` so SessionScreen can stop the recording and prompt a re-record before
// anything is uploaded.
//
// Checks run only while `active` (recording): passing null inputs uses each leaf
// hook's `if (!input) return` guard, fully tearing down MediaPipe + AudioContexts
// when idle (no background cost). See ARCHITECTURE.md → "Media Stream Flow".
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCameraCheck } from './useCameraCheck'
import { useLightingCheck } from './useLightingCheck'
import { useNoiseCheck } from './useNoiseCheck'
import { useMicActivity } from './useMicActivity'

// How long a check may stay FAIL before it stops the recording. Mic owns its own
// 10s silence window inside useMicActivity, so its grace here is 0 (trip on FAIL).
// Camera gets longer because the story is covered after 2s (useStoryBlock), which
// leaves the learner time to notice, read the note and move back.
const GRACE_MS = { mic: 0, noise: 5000, lighting: 5000, camera: 8000 }
// Cushion the video checks at the very start of a take so camera warm-up
// (readyState) and MediaPipe (re)loading its WASM don't count as a real failure.
const STARTUP_GRACE_MS = 1500

export function useRecordingMonitor({ audioTrack, videoElement, active }) {
  const camera = useCameraCheck(active ? videoElement : null)
  const lighting = useLightingCheck(active ? videoElement : null)
  const noise = useNoiseCheck(active ? audioTrack : null)
  const mic = useMicActivity(active ? audioTrack : null)

  const [failure, setFailure] = useState(null)

  // Refs keep the watchdog StrictMode- and stale-closure-safe.
  const firedRef = useRef(false)
  const activeRef = useRef(active)
  const startedAtRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
    if (active) {
      firedRef.current = false
      startedAtRef.current = Date.now()
    }
  }, [active])

  // `failure` persists after the recording stops so SessionScreen can read the
  // reason; the consumer clears it (from an event handler, not an effect) before
  // the next take so a stale failure can't re-trigger.
  const clearFailure = useCallback(() => setFailure(null), [])

  // One watchdog per check, keyed on that check's single status string so a flip
  // on one check never resets another's accumulated grace.
  useFailureTimer('mic', mic.status, mic.message, GRACE_MS.mic, false, active, firedRef, activeRef, startedAtRef, setFailure)
  useFailureTimer('noise', noise.status, noise.message, GRACE_MS.noise, false, active, firedRef, activeRef, startedAtRef, setFailure)
  useFailureTimer('lighting', lighting.status, lighting.message, GRACE_MS.lighting, true, active, firedRef, activeRef, startedAtRef, setFailure)
  useFailureTimer('camera', camera.status, camera.message, GRACE_MS.camera, true, active, firedRef, activeRef, startedAtRef, setFailure)

  return { checks: { mic, noise, lighting, camera }, failure, clearFailure }
}

// Arms a timer while `status === 'FAIL'`; cleanup cancels it the moment the check
// returns to PASS/CHECKING or recording stops, so only a *continuous* failure
// fires. Once any check fires, firedRef latches so we raise exactly one failure.
// `message` is a dependency so the fired reason is whatever was current — the FAIL
// message is stable per check, so this doesn't churn the timer (and mic's grace is
// 0 anyway).
function useFailureTimer(key, status, message, graceMs, isVideo, active, firedRef, activeRef, startedAtRef, setFailure) {
  useEffect(() => {
    if (!active || status !== 'FAIL') return // PASS / CHECKING → cancel via cleanup

    let delay = graceMs
    if (isVideo) {
      const sinceStart = Date.now() - startedAtRef.current
      delay = Math.max(graceMs, STARTUP_GRACE_MS - sinceStart + graceMs)
    }

    const id = setTimeout(() => {
      if (!activeRef.current || firedRef.current) return
      firedRef.current = true
      setFailure({ check: key, message })
    }, delay)

    return () => clearTimeout(id)
  }, [status, message, active, graceMs, isVideo, key, activeRef, firedRef, startedAtRef, setFailure])
}
