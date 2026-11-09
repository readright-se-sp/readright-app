/**
 * usePassage
 *
 * Loads the passage for this session. Two sources until the v1 API is live:
 *
 *   v1 API  — POST /v1/me/sessions picks the passage for `passageGradeId` and
 *             creates the session (see lib/api.js → startSession).
 *   Static  — picks one of the samples in data/sampleData.js at random. There is
 *             no session id. The frontend must not query Supabase directly.
 *
 * Mirrors the GO1 check hooks' lib/hook split: the network call is pure in lib/,
 * this hook owns the React state and lifecycle. The passage is chosen once per
 * mount; `retry()` re-fetches so a failed load gives the learner a recovery
 * action, and gives the v1 flow a new session after a failed analysis.
 *
 * Returns
 * -------
 *   passage    {object|null}  { id, title?, text, wordCount } once loaded, else null.
 *   sessionId  {string|null}  The session the passage belongs to (v1 API only).
 *   loading    {boolean}      True while the fetch is in-flight.
 *   error      {Error|null}   Set when the fetch fails or the table is empty.
 *   retry      {function}     Re-runs the fetch.
 */
import { useCallback, useEffect, useState } from 'react'
import { samplePassages } from '../data/sampleData'
import { isV1Enabled, startSession } from '../lib/api'

const fetchPassages = async () => samplePassages

export function usePassage(passageGradeId) {
  const [passage, setPassage] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (isV1Enabled()) {
          // Clear first: the old passage must not stay readable under a new session.
          setPassage(null)
          setSessionId(null)
          const session = await startSession(passageGradeId)
          if (cancelled) return
          setPassage(session.passage)
          setSessionId(session.session_id)
          return
        }
        const passages = await fetchPassages()
        if (cancelled) return
        if (passages.length === 0) {
          setError(new Error('No passages available'))
          setPassage(null)
        } else {
          setPassage(passages[Math.floor(Math.random() * passages.length)])
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [attempt, passageGradeId])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { passage, sessionId, loading, error, retry }
}
