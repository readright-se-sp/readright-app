import { useEffect, useRef, useState } from 'react'

// TODO(backend): nothing is saved for now — replace with the backend call. The
// frontend must not write to Supabase directly.
const saveSessionRecord = async () => ({ success: true })

/**
 * useSessionStorage — persists one completed session (RR-041 · REA-26).
 *
 * Wraps saveSessionRecord with the React-side concerns: a once-guard so
 * StrictMode's double-invoked effect can't save twice, and a status the results
 * page can switch on. The save never blocks rendering — results show regardless
 * of the outcome (NFR-R1).
 *
 * Runs once, when both `result` and `passageId` are first available.
 *
 * saveStatus: 'idle' | 'saved' | 'failed'
 *   'idle' covers both "not started" and "in flight" — the results page only
 *   needs to react to 'failed' (to show the banner), and we set status only from
 *   the async resolution to avoid a synchronous setState in the effect body
 *   (react-hooks/set-state-in-effect).
 *
 * @param {object|null} result    — AssessmentResultJSON
 * @param {string|null} passageId
 * @returns {{ saveStatus: 'idle'|'saved'|'failed' }}
 */
export function useSessionStorage(result, passageId) {
  const [saveStatus, setSaveStatus] = useState('idle')
  const savedRef = useRef(false)

  useEffect(() => {
    if (!result || !passageId || savedRef.current) return
    savedRef.current = true
    saveSessionRecord(result, passageId).then(({ success }) =>
      setSaveStatus(success ? 'saved' : 'failed'),
    )
  }, [result, passageId])

  return { saveStatus }
}
