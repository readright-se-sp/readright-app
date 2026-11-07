import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ApiError,
  getResult,
  getSessionStatus,
  submitComprehension,
  submitRecording,
  uploadRecording,
} from '../lib/api'

/**
 * useAnalyzeSubmit — the analysis state machine (REA-34 · RR-050).
 *
 * Wraps the pure fetches in lib/api.js with the React-side concerns they need:
 * an AbortController, timeouts, abort-on-unmount, and a status state machine the
 * UI can switch on. The network calls stay in lib/api.js.
 *
 * With a `sessionId` (v1 API), submit uploads the recording, then polls the
 * session until the analysis is finished AND the quiz is submitted, then fetches
 * the result. submitAnswers posts the quiz answers while that polling runs.
 * Without one (old flow), submit holds a single POST /analyze open for up to 120s.
 *
 * status: 'idle' | 'submitting' | 'success' | 'error' | 'timeout'
 *   - 'timeout' is reported separately from 'error' so the UI can show specific,
 *     recovery-oriented copy (CLAUDE.md error rules) instead of one generic message.
 *
 * @returns {{
 *   status: 'idle'|'submitting'|'success'|'error'|'timeout',
 *   result: object|null,           // AssessmentResultJSON on success
 *   error: Error|null,             // the thrown error on 'error'
 *   sessionSpent: boolean,         // the failed session can't take another recording
 *   submit: (file: File|Blob, take: { passageId: string, sessionId?: string|null, durationSeconds?: number }) => Promise<object|null>,
 *   submitAnswers: (answers: object[]) => Promise<void>,
 *   reset: () => void,             // back to 'idle' before a fresh take
 * }}
 */

const OLD_FLOW_TIMEOUT_MS = 120_000
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000 // same as the presigned link's lifetime
const RESULT_TIMEOUT_MS = 10 * 60 * 1000 // same as the backend's stuck-session limit
const POLL_INTERVAL_MS = 2500
const MAX_POLL_FAILURES = 5 // in a row; one dropped poll shouldn't end the session
const MAX_ANSWER_ATTEMPTS = 3

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

/** Polls until the result can be fetched. Throws when the analysis failed. */
async function waitUntilReady(sessionId, signal) {
  let failures = 0
  for (;;) {
    signal.throwIfAborted()
    await wait(POLL_INTERVAL_MS, signal)
    let session
    try {
      session = await getSessionStatus(sessionId, { signal })
      failures = 0
    } catch (err) {
      failures += 1
      if (err.name === 'AbortError' || failures >= MAX_POLL_FAILURES) throw err
      continue
    }
    if (session.analysis_status === 'failed') {
      throw new ApiError('ANALYSIS_FAILED', 'Analysis failed')
    }
    const analyzed = session.analysis_status === 'completed' || session.analysis_status === 'partial'
    if (analyzed && session.comprehension_status === 'submitted') return
  }
}

export function useAnalyzeSubmit() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [sessionSpent, setSessionSpent] = useState(false)

  const controllerRef = useRef(null)
  const mountedRef = useRef(true)
  const timeoutRef = useRef(null)
  // Current v1 take: { sessionId, uploaded: Promise<boolean> }
  const takeRef = useRef(null)

  const startTimeout = useCallback((ms) => {
    clearTimeout(timeoutRef.current)
    const controller = controllerRef.current
    timeoutRef.current = setTimeout(() => controller?.abort(), ms)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(timeoutRef.current)
      controllerRef.current?.abort() // cancel an in-flight request on unmount
    }
  }, [])

  const fail = useCallback((err) => {
    clearTimeout(timeoutRef.current)
    controllerRef.current?.abort() // stop the polling too
    if (!mountedRef.current) return
    if (err.name === 'AbortError') setStatus('timeout')
    else {
      setError(err)
      setStatus('error')
    }
  }, [])

  const submit = useCallback(async (file, { passageId, sessionId, durationSeconds }) => {
    setStatus('submitting')
    setError(null)
    setResult(null)
    setSessionSpent(false)

    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller
    startTimeout(sessionId ? UPLOAD_TIMEOUT_MS : OLD_FLOW_TIMEOUT_MS)

    try {
      let data
      if (sessionId) {
        const upload = uploadRecording(sessionId, file, durationSeconds, { signal })
        takeRef.current = {
          sessionId,
          uploaded: upload.then(() => true, () => false),
        }
        await upload
        // The upload is done, so the quiz may run as long as it needs. The
        // result timeout starts once the answers are in (submitAnswers).
        clearTimeout(timeoutRef.current)
        try {
          await waitUntilReady(sessionId, signal)
          data = await getResult(sessionId, { signal })
        } catch (err) {
          // The backend already has this recording: a new take needs a new session.
          if (mountedRef.current) setSessionSpent(true)
          throw err
        }
      } else {
        data = await submitRecording(file, passageId, { signal })
      }
      clearTimeout(timeoutRef.current)
      if (!mountedRef.current) return null
      setResult(data)
      setStatus('success')
      return data
    } catch (err) {
      // Aborted by a failure in submitAnswers: that already set the status.
      if (controllerRef.current === controller) fail(err)
      return null
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [fail, startTimeout])

  const submitAnswers = useCallback(async (answers) => {
    const take = takeRef.current
    if (!take) return // old flow: nothing stores the answers
    // Only after the upload: if it fails, the learner retakes this same session,
    // and a second set of answers for it would be rejected.
    if (!(await take.uploaded)) return

    const controller = controllerRef.current
    if (!controller) return // the analysis already failed

    for (let attempt = 1; attempt <= MAX_ANSWER_ATTEMPTS; attempt++) {
      try {
        await submitComprehension(take.sessionId, answers, { signal: controller.signal })
        break
      } catch (err) {
        // 409: an earlier attempt got through, and only its response was lost.
        if (err.status === 409) break
        if (err.name === 'AbortError') return
        if (attempt === MAX_ANSWER_ATTEMPTS) {
          if (mountedRef.current) setSessionSpent(true)
          fail(err)
          controllerRef.current = null
          return
        }
        await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
      }
    }
    startTimeout(RESULT_TIMEOUT_MS)
  }, [fail, startTimeout])

  const reset = useCallback(() => {
    takeRef.current = null
    setStatus('idle')
    setResult(null)
    setError(null)
    setSessionSpent(false)
  }, [])

  return { status, result, error, sessionSpent, submit, submitAnswers, reset }
}
