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
 * newest) so chart data always renders left-to-right across time.
 *
 * TODO(backend): static samples for now (data/sampleData.js) — replace with the
 * backend call. The frontend must not query Supabase directly.
 *
 * Returns
 * -------
 *   sessions  {Array}   All session rows for this learner, sorted by
 *                       session_timestamp ASC.
 *   loading   {boolean} True while the initial load is in-flight.
 *   error     {object|null} Set if the load fails.
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
 *                return shape { sessions, loading, error } or the query order.
 */
import { sampleSessions } from '../data/sampleData'

export function useSessionHistory() {
  return { sessions: sampleSessions, loading: false, error: null }
}
