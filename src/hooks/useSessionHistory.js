/**
 * useSessionHistory
 *
 * Linear  : REA-27 · RR-042 Progress Dashboard (In Progress)
 * URL     : https://linear.app/readright/issue/REA-27/rr-042-progress-dashboard
 * Project : GO4 — Results & Dashboard
 * Assignee: Christian  |  Priority: High  |  Estimate: 3 pts
 * Created : 2026-05-17 by Reev Santillan
 *
 * Fetches the authenticated learner's full session history from Supabase,
 * ordered chronologically (oldest → newest) so chart data always renders
 * left-to-right across time.
 *
 * Returns
 * -------
 *   sessions  {Array}   All rows from the `sessions` table for this learner,
 *                       sorted by session_timestamp ASC.
 *   loading   {boolean} True while the initial query is in-flight.
 *   error     {object|null} Supabase PostgrestError if the query fails.
 *   retry     {Function} Re-runs the query (the dashboard's "Try again").
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
 *
 * Security note
 * -------------
 *   Supabase RLS ensures each learner only sees their own rows. The session
 *   persists across reloads (see supabase.js), so this hook re-fetches on each
 *   mount against the restored session; it returns an empty array only if the
 *   session is genuinely absent or expired.
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSessionHistory() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('session_timestamp', { ascending: true })
      if (cancelled) return
      if (error) setError(error)
      else setSessions(data)
      setLoading(false)
    }
    fetchSessions()
    return () => {
      cancelled = true
    }
  }, [attempt])

  // "Try again" on the dashboard error card: re-runs the query in place.
  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setAttempt((n) => n + 1)
  }, [])

  return { sessions, loading, error, retry }
}
