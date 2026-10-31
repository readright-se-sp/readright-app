// useCameraCheck.js — STUB (RR-003)
// Implementation: see SDD GO1 / GO4 module for spec.
import { useState, useEffect } from 'react'

const WASM_TIMEOUT_MS = 10000
// Forgiving thresholds for young learners on phones: accept faces that are
// off-center and held at a comfortable distance (not filling the oval).
const CENTER_TOLERANCE = 0.38
// `yaw` below is the horizontal eye span — a face-size / proximity proxy that
// also shrinks when the head turns far sideways. A low threshold still rejects
// "no face" and extreme turns, but no longer forces the face right up close.
const YAW_THRESHOLD = 0.13

export function useCameraCheck(videoElement) {
  const [cameraStatus, setCameraStatus] = useState('CHECKING')
  const [message, setMessage] = useState('Initializing camera check...')

  useEffect(() => {
    if (!videoElement) return

    // Per-run state (not refs): the input toggles quickly (e.g. /session gating
    // the check on/off around a take), and a later run must never touch an
    // earlier run's FaceMesh — closing an already-deleted instance throws a
    // BindingError that crashes the page.
    let cancelled = false
    let faceMesh = null

    // Auto-pass fallback if WASM doesn't load in time
    const timeoutId = setTimeout(() => {
      if (cancelled) return
      console.warn('[GO1] MediaPipe WASM failed to load — camera check auto-passed')
      setCameraStatus('PASS')
      setMessage('Camera: Ready')
    }, WASM_TIMEOUT_MS)

    async function init() {
      try {
        const { FaceMesh } = await import('@mediapipe/face_mesh')

        if (cancelled) return
        clearTimeout(timeoutId)

        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
        })

        faceMesh.onResults((results) => {
          if (cancelled) return

          if (!results.multiFaceLandmarks?.length) {
            setCameraStatus('FAIL')
            setMessage('No face detected. Please position your face in front of the camera.')
            return
          }

          const landmarks = results.multiFaceLandmarks[0]
          const leftEye = landmarks[33]
          const rightEye = landmarks[263]

          // Check if face is centered horizontally
          const faceCenterX = (leftEye.x + rightEye.x) / 2
          const isCentered = Math.abs(faceCenterX - 0.5) < CENTER_TOLERANCE

          // Horizontal eye span (normalized 0-1): large when the face is close
          // and forward, small when it's far away OR turned hard to one side.
          const yaw = Math.abs(leftEye.x - rightEye.x)
          const isLevel = yaw > YAW_THRESHOLD // too small = far away or extreme turn

          if (!isCentered || !isLevel) {
            setCameraStatus('FAIL')
            setMessage('Please center your face and hold the device at eye level.')
            return
          }

          setCameraStatus('PASS')
          setMessage('Camera: Ready')
        })

        // Feed frames to MediaPipe. A send() in flight when cleanup closes the
        // instance rejects — expected during teardown, so stop quietly.
        async function detectLoop() {
          if (cancelled) return
          try {
            if (videoElement.readyState >= 2) {
              await faceMesh.send({ image: videoElement })
            }
          } catch {
            return
          }
          requestAnimationFrame(detectLoop)
        }
        detectLoop()

      } catch (err) {
        if (cancelled) return
        clearTimeout(timeoutId)
        console.warn('[GO1] MediaPipe failed to load — camera check auto-passed', err)
        setCameraStatus('PASS')
        setMessage('Camera: Ready')
      }
    }

    init()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      // Close only this run's instance, exactly once. Guard anyway: a throw
      // from MediaPipe here would otherwise take down the whole screen.
      try {
        faceMesh?.close()
      } catch (err) {
        console.warn('[GO1] FaceMesh close failed', err)
      }
      faceMesh = null
    }
  }, [videoElement])

  return { status: cameraStatus, message }
}
