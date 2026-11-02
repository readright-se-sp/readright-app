/**
 * sampleReadingResults.js — placeholder full results for past readings, so
 * /history/:sessionId can show the same cards as /results.
 *
 * TODO(backend): each finished reading's full result should be saved and
 * fetched by session id. Until then, a session's own numbers (speed, word
 * recognition, level, miscue counts, behaviour flags) are kept and the fields
 * sessions don't save yet (comprehension_level, miscue_details) are borrowed
 * from the matching data/sampleResults.js sample.
 */
import { sampleResults } from './sampleResults'

const BY_LEVEL = {
  Independent: sampleResults.independent,
  Instructional: sampleResults.instructional,
  Frustration: sampleResults.frustration,
}

/** Same shape as the /analyze result the results cards read. */
export function placeholderResult(session) {
  return { ...(BY_LEVEL[session.reading_level] ?? {}), ...session, dev_sample: true }
}
