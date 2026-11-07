/**
 * useSessionHistory
 *
 * Linear  : REA-27 · RR-042 Progress Dashboard (In Progress)
 * URL     : https://linear.app/readright/issue/REA-27/rr-042-progress-dashboard
 * Project : GO4 — Results & Dashboard
 * Assignee: Christian  |  Priority: High  |  Estimate: 3 pts
 * Created : 2026-05-17 by Reev Santillan
 *
 * Returns the learner's session history, ordered chronologically (oldest →
 * newest) so chart data always renders left-to-right across time. Comes from
 * GET /v1/dashboard when VITE_USE_V1_API is 'true', otherwise from the static
 * samples (data/sampleData.js). The frontend must not query Supabase directly.
 *
 * Returns
 * -------
 *   sessions  {Array}   All session rows for this learner, sorted by
 *                       session_timestamp ASC.
 *   loading   {boolean} True while the initial load is in-flight.
 *   error     {object|null} Set if the load fails.
 *   retry     {Function} Re-runs the load (the dashboard's "Try again"); does
 *                       nothing while the data is static.
 *
 * Session row shape — 19 fields matching AssessmentResultJSON in api.js:
 *   Core identifiers  : learner_id, passage_id, session_timestamp
 *   GO2 scoring       : wpm, word_recognition_pct, reading_level
 *                       reading_level ∈ { 'Frustration' | 'Instructional' | 'Independent' }
 *   GO2 miscue counts : correct, mispronunciation, substitution, omission,
 *                       insertion, repetition, refusal_to_pronounce
 *   GO3 behavioral    : finger_pointing, loss_of_place, monotone_reading,
 *                       word_by_word_reading, inaudible_reading
 *
 * Dependencies
 * ------------
 *   Blocked by : REA-6 · RR-002 (Deploy Sessions Table Schema with RLS)
 *                The `sessions` table and its RLS policies must exist in
 *                Supabase before this hook returns data. For local dev, seed
 *                the table using the SQL in zplan.md §"Seed Data" with the
 *                test account test.learner@readright.dev.
 *
 *   Blocks     : REA-33 · RR-049 (Dashboard Miscue + Behavioral History Charts)
 *                That ticket will consume this same hook to power the Miscue
 *                Patterns and Behavioral History sections. Do NOT alter the
 *                return shape { sessions, loading, error } (retry was added
 *                alongside) or the query order.
 */
import { useCallback, useEffect, useState } from 'react'
import { sampleSessions } from '../data/sampleData'
import { getDashboard } from '../lib/api'

const USE_API = import.meta.env.VITE_USE_V1_API === 'true'

// /v1/dashboard also lists sessions with no finished reading (assigned, failed);
// their miscue counts are null, and they must not count towards stats or charts.
function hasReadingResult(session) {
  return session.correct != null
}

// Maps a /v1/dashboard row to the session row shape documented above.
function toSessionRow(session) {
  const level = session.reading_level
  return {
    ...session,
    id: session.session_id, // /history/:id
    session_timestamp: session.completed_at ?? session.assigned_at,
    reading_level: level && level[0].toUpperCase() + level.slice(1).toLowerCase(),
  }
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState(USE_API ? [] : sampleSessions)
  const [loading, setLoading] = useState(USE_API)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!USE_API) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const dashboard = await getDashboard()
        if (cancelled) return
        // A backend not yet updated may still send the older recent_sessions shape.
        if (!Array.isArray(dashboard.sessions)) throw new Error('Dashboard response has no sessions')
        setSessions(dashboard.sessions.filter(hasReadingResult).map(toSessionRow))
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
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { sessions, loading, error, retry }
}
