/**
 * useReadingResult
 *
 * One past reading and its full result, for /history/:sessionId.
 *
 * TODO(backend): replace with the backend call that fetches one reading's
 * full result by id. For now it looks the session up in useSessionHistory's
 * static samples and builds a placeholder result (data/sampleReadingResults.js).
 * Read-only — nothing is saved, changed or deleted.
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
import { useSessionHistory } from './useSessionHistory'
import { placeholderResult } from '../data/sampleReadingResults'

/** Finds `sessionId` in `sessions` (oldest → newest). Shared with the dev preview. */
export function findReading(sessions, sessionId) {
  const index = sessions.findIndex((s) => String(s.id) === sessionId)
  if (index === -1) return { session: null, number: null, result: null }
  const session = sessions[index]
  return { session, number: index + 1, result: placeholderResult(session) }
}

export function useReadingResult(sessionId) {
  const { sessions, loading, error, retry } = useSessionHistory()
  return { ...findReading(sessions, sessionId), loading, error, retry }
}
