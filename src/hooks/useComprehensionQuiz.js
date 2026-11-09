import { useCallback, useEffect, useState } from 'react'
import { getQuestions } from '../lib/api'
import { sampleQuestions } from '../data/sampleQuestions'

/**
 * useComprehensionQuiz — the comprehension questions shown after a reading.
 *
 * With a `sessionId` (v1 API), loads the questions for the session's passage
 * (pure fetch in lib/api.js, state in this hook — same split as usePassage).
 * Without one (static samples), returns the same sample questions for every passage.
 *
 * Question shape: { id, question, options: string[] } — 3 or 4 options. The
 * learner may also answer "I don't know" (recorded as choice 'idk').
 *
 * @param {string|null} sessionId
 * @returns {{ questions: object[], loading: boolean, error: Error|null, retry: () => void }}
 */
export function useComprehensionQuiz(sessionId) {
  const [questions, setQuestions] = useState(sessionId ? [] : sampleQuestions)
  const [loading, setLoading] = useState(!!sessionId)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const loaded = await getQuestions(sessionId)
        if (cancelled) return
        if (loaded.length === 0) setError(new Error('No questions available'))
        else setQuestions(loaded)
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
  }, [sessionId, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { questions, loading, error, retry }
}
