import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[ReadRight] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your values from RR-001.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Session persists across reloads/tab restarts so a learner stays signed in
    // (UX decision — supersedes the old "memory-only JWT" rule, NFR-S3). The SDK
    // stores the token in localStorage by default; we let it own that storage and
    // do NOT hand-roll any token persistence. Trade-off: a localStorage token is
    // readable by page scripts (XSS exposure). httpOnly cookies are not an option
    // for this serverless SPA, so this is an accepted, deliberate trade-off.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

const MAX_RETRIES = 3

/**
 * saveSessionRecord — persist one completed session to `sessions` (RR-041).
 *
 * Fallback write: the *primary* INSERT happens server-side in FastAPI with the
 * service key (RR-020). This client-side write runs from the results page so a
 * learner's session is never lost — they always see results whether or not the
 * save succeeds (SRS NFR-R1).
 *
 * Retries up to MAX_RETRIES times with exponential backoff between attempts
 * (1s, then 2s) before giving up. learner_id is read from the live session, not
 * passed in, because RLS only accepts the row when learner_id === auth.uid().
 *
 * The record is built from the flat AssessmentResultJSON (see lib/api.js) — the
 * 19-column sessions schema. miscue/behavior fields are top-level, not nested.
 *
 * @param {object} assessmentResult — flat AssessmentResultJSON from /analyze
 * @param {string} passageId        — the `passages` row UUID (see fetchPassages)
 * @returns {Promise<{ success: boolean }>}
 */
export async function saveSessionRecord(assessmentResult, passageId) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { success: false }

  const record = {
    learner_id: session.user.id,
    passage_id: passageId,
    session_timestamp: new Date().toISOString(),
    wpm: assessmentResult.wpm,
    word_recognition_pct: assessmentResult.word_recognition_pct,
    reading_level: assessmentResult.reading_level,
    correct: assessmentResult.correct,
    mispronunciation: assessmentResult.mispronunciation,
    substitution: assessmentResult.substitution,
    omission: assessmentResult.omission,
    insertion: assessmentResult.insertion,
    repetition: assessmentResult.repetition,
    refusal_to_pronounce: assessmentResult.refusal_to_pronounce,
    finger_pointing: assessmentResult.finger_pointing,
    loss_of_place: assessmentResult.loss_of_place,
    monotone_reading: assessmentResult.monotone_reading,
    word_by_word_reading: assessmentResult.word_by_word_reading,
    inaudible_reading: assessmentResult.inaudible_reading,
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.from('sessions').insert(record)
    if (!error) return { success: true }
    console.warn(`[supabase] session insert attempt ${attempt}/${MAX_RETRIES} failed:`, error.message)
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    }
  }
  return { success: false }
}

/**
 * fetchPassages — load the available reading passages from Supabase.
 *
 * The `passages` table is the single source of truth for passage content; the
 * frontend no longer ships a hardcoded bank. Columns are mapped to the camelCase
 * shape the session UI expects (`word_count` → `wordCount`). The table has no
 * `title` column — SessionScreen shows a static heading instead. Selection
 * (random per session) is the caller's job; see the `usePassage` hook.
 *
 * The DB primary-key column is `passage_id`; it is mapped to `id` in the
 * returned objects so downstream code keeps using `passage.id`.
 *
 * SELECT is allowed for the learner under RLS; ordering by `created_at` keeps
 * the returned list stable so random picks are reproducible across a render.
 *
 * @returns {Promise<Array<{ id: string, text: string, wordCount: number }>>}
 * @throws  {Error} when the query fails — the caller surfaces a recovery message.
 */
export async function fetchPassages() {
  const { data, error } = await supabase
    .from('passages')
    .select('passage_id, text, word_count')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.passage_id,
    text: row.text,
    wordCount: row.word_count,
  }))
}
