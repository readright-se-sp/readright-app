import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useMediaRecorder — the recording layer (see ARCHITECTURE.md).
 *
 * Consumes a MediaStream acquired by useMediaStream and manages MediaRecorder
 * + the recorded blob only. It NEVER calls getUserMedia and NEVER stops the
 * stream's tracks — useMediaStream owns the stream lifecycle, so the live
 * preview and GO1 checks keep running after a recording stops.
 *
 * @param {MediaStream | null} stream
 * @param {{ maxDurationMs?: number }} [options]
 * @returns {{
 *   recordingState: 'idle' | 'recording',
 *   elapsed: number,             // whole seconds since start()
 *   start: () => void,
 *   stop: () => Promise<File|null>, // resolves once the recorder flushes
 * }}
 */

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  // Prefer WebM everywhere; fall back to MP4 only on browsers that can't
  // record WebM (older iOS Safari).
  return MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/mp4'
}

export function useMediaRecorder(stream, { maxDurationMs } = {}) {
  const [recordingState, setRecordingState] = useState('idle')
  const [elapsed, setElapsed] = useState(0)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const autoStopRef = useRef(null)

  const clearTimers = useCallback(() => {
    clearInterval(timerRef.current)
    clearTimeout(autoStopRef.current)
    timerRef.current = null
    autoStopRef.current = null
  }, [])

  const start = useCallback(() => {
    if (!stream || recorderRef.current) return

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start()
    setRecordingState('recording')
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    if (maxDurationMs) {
      autoStopRef.current = setTimeout(() => recorderRef.current?.stop(), maxDurationMs)
    }
  }, [stream, maxDurationMs])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    clearTimers()
    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(null)
    }
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || pickMimeType()
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const file = new File([blob], `recording.${ext}`, { type: mimeType })
        recorderRef.current = null
        setRecordingState('idle')
        resolve(file)
      }
      recorder.stop()
    })
  }, [clearTimers])

  // Cleanup: stop an in-flight recorder + timers on unmount. Never touch tracks.
  useEffect(() => {
    return () => {
      clearTimers()
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null
        recorder.stop()
      }
      recorderRef.current = null
    }
  }, [clearTimers])

  return { recordingState, elapsed, start, stop }
}
