/**
 * useReadingResult
 *
 * One past reading and its full result, for /history/:sessionId.
 *
 * With VITE_USE_V1_API on, the result comes from GET /v1/me/sessions/{id}/result.
 * Otherwise it looks the session up in useSessionHistory's static samples and
 * builds a placeholder result (data/sampleReadingResults.js). Read-only —
 * nothing is saved, changed or deleted.
 *
 * Returns
 * -------
 *   session  {object|null}  The session row, or null when not found.
 *   number   {number|null}  Its place in the full history (1 = first reading),
 *                           for the "Story N" fallback title.
 *   result   {object|null}  Full result in the /analyze shape, or null.
 *   loading  {boolean}
 *   error    {object|null}
 *   retry    {Function}
 */
import { useCallback, useEffect, useState } from 'react'
import { useSessionHistory } from './useSessionHistory'
import { getResult } from '../lib/api'
import { placeholderResult } from '../data/sampleReadingResults'

const USE_API = import.meta.env.VITE_USE_V1_API === 'true'

/** Finds `sessionId` in `sessions` (oldest → newest). Shared with the dev preview. */
export function findReading(sessions, sessionId) {
  const index = sessions.findIndex((s) => String(s.id) === sessionId)
  if (index === -1) return { session: null, number: null, result: null }
  const session = sessions[index]
  return { session, number: index + 1, result: placeholderResult(session) }
}

export function useReadingResult(sessionId) {
  const { sessions, loading, error, retry: retryHistory } = useSessionHistory()
  const reading = findReading(sessions, sessionId)
  const found = reading.session != null

  const [apiResult, setApiResult] = useState(null)
  const [resultLoading, setResultLoading] = useState(USE_API)
  const [resultError, setResultError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Only for a reading in this learner's history; anything else is "not found".
    if (!USE_API || !found) return
    let cancelled = false

    async function load() {
      setResultLoading(true)
      setResultError(null)
      try {
        const loaded = await getResult(sessionId)
        if (!cancelled) setApiResult(loaded)
      } catch (err) {
        if (!cancelled) setResultError(err)
      } finally {
        if (!cancelled) setResultLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [sessionId, found, attempt])

  const retry = useCallback(() => {
    retryHistory()
    setAttempt((n) => n + 1)
  }, [retryHistory])

  if (!USE_API) return { ...reading, loading, error, retry: retryHistory }

  return {
    ...reading,
    result: apiResult,
    loading: loading || (found && resultLoading),
    error: error ?? resultError,
    retry,
  }
}
