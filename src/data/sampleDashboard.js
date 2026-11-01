/**
 * sampleDashboard.js — dev-only session history for previewing the dashboard
 * (npm run dev only; see DashboardPage):
 *
 *   /dashboard?sample           → full history over the last four weeks, with
 *                                 the not-yet-saved fields (comprehension_level,
 *                                 miscue_details, passage_title) filled in
 *   /dashboard?sample=basic     → same readings without those fields, so the
 *                                 "Coming soon" boxes show
 *   /dashboard?sample=empty     → first-time learner (no readings)
 *   /dashboard?sample=loading   → loading state
 *   /dashboard?sample=error     → error state
 *
 * Rows match the Supabase `sessions` table (see useSessionHistory). Dates are
 * relative to today so the weekly sections always have data.
 */

const BASE = {
  correct: 0,
  mispronunciation: 1,
  substitution: 1,
  omission: 0,
  insertion: 0,
  repetition: 0,
  refusal_to_pronounce: 0,
  finger_pointing: false,
  loss_of_place: false,
  monotone_reading: false,
  word_by_word_reading: false,
  inaudible_reading: false,
}

// [days ago, title, level, wpm, word recognition %, comprehension, extra fields]
const READINGS = [
  [24, 'Market Day', 'Frustration', 54, 88, 1, { word_by_word_reading: true,
    miscue_details: { mispronunciation: [{ said: 'fir', expected: 'fire' }], substitution: [{ said: 'horse', expected: 'house' }] } }],
  [22, 'The Lost Kite', 'Frustration', 61, 90, 1, { monotone_reading: true,
    miscue_details: { mispronunciation: [{ said: 'becos', expected: 'because' }, { said: 'fir', expected: 'fire' }] } }],
  [10, 'Rain in Baguio', 'Instructional', 63, 93, 2, { word_by_word_reading: true,
    miscue_details: { substitution: [{ said: 'dug', expected: 'dog' }], mispronunciation: [{ said: 'litel', expected: 'little' }] } }],
  [8, "Lola's Garden", 'Instructional', 69, 94, 2, { word_by_word_reading: true,
    miscue_details: { mispronunciation: [{ said: 'fir', expected: 'fire' }, { said: 'becos', expected: 'because' }] } }],
  [2, 'The Brave Little Carabao', 'Instructional', 72, 95, 3, { word_by_word_reading: true,
    miscue_details: { substitution: [{ said: 'dug', expected: 'dog' }, { said: 'horse', expected: 'house' }] } }],
  [1, 'Fiesta in Our Town', 'Independent', 76, 97, 3, { miscue_details: {} }],
  [0, 'The Mango Tree', 'Independent', 78, 98, 3, { miscue_details: {} }],
]

function atDaysAgo(days, hour = 16) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, 0, 0, 0)
  // Today's sample reading is never in the future.
  return (d > new Date() ? new Date(Date.now() - 60_000) : d).toISOString()
}

function buildSessions(withNewFields) {
  return READINGS.map(([days, title, level, wpm, pct, comprehension, extra], i) => {
    const { miscue_details, ...flags } = extra
    const row = {
      ...BASE,
      ...flags,
      id: `sample-${i}`,
      session_timestamp: atDaysAgo(days),
      reading_level: level,
      wpm,
      word_recognition_pct: pct,
      correct: pct,
      dev_sample: true,
    }
    return withNewFields ? { ...row, passage_title: title, comprehension_level: comprehension, miscue_details } : row
  })
}

/** @returns {{ sessions: object[], loading: boolean, error: object|null } | null} */
export function sampleDashboard(name) {
  switch (name) {
    case 'empty':
      return { sessions: [], loading: false, error: null }
    case 'loading':
      return { sessions: [], loading: true, error: null }
    case 'error':
      return { sessions: [], loading: false, error: { message: 'Sample error (dev)' } }
    case 'basic':
      return { sessions: buildSessions(false), loading: false, error: null }
    default:
      return { sessions: buildSessions(true), loading: false, error: null }
  }
}
