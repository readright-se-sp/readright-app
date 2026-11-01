// devPreview.js — dev-only tools for reviewing the UI without the FastAPI
// backend (e.g. while localhost is blocked by CORS). Everything is gated by
// import.meta.env.DEV, so production builds never fake anything.
//
// Fake analysis — skip /analyze after "I'm done!" and finish with a sample result:
//   ?fakeAnalysis        → 45s "analysis", then the sample result
//   ?fakeAnalysis=20     → custom length in seconds
//   ?fakeAnalysis=fail   → simulate a failed analysis
//   ?fakeAnalysis=0      → back to the real backend
// Add it to any page URL once; it lasts for the browser tab (sessionStorage).
// The default is long enough to still be "analyzing" after the comprehension
// quiz, so the analyzing screen is visible.
//
// Sample results on /results (no reading needed): see SessionResultsPage.
//
// Fake and sample results carry `dev_sample: true` and are never saved to
// Supabase (SessionResultsPage skips the save), so they can't pollute history.

const FAKE_ANALYSIS_KEY = 'rr_dev_fake_analysis'
const DEFAULT_SECONDS = 45

/** @returns {string|null} '45' / 'fail' etc. when fake analysis is on (dev only). */
export function getFakeAnalysis() {
  if (!import.meta.env.DEV) return null
  try {
    return sessionStorage.getItem(FAKE_ANALYSIS_KEY)
  } catch {
    return null
  }
}

/** @param {number|string|false} value — seconds, 'fail', or false/0 to turn off */
export function setFakeAnalysis(value) {
  if (!import.meta.env.DEV) return
  try {
    if (value === false || value === '0' || value === 0) sessionStorage.removeItem(FAKE_ANALYSIS_KEY)
    else sessionStorage.setItem(FAKE_ANALYSIS_KEY, String(value === true || value === '' ? DEFAULT_SECONDS : value))
  } catch {
    // Storage blocked (private mode) — the flag just stays off.
  }
}

// Pick up ?fakeAnalysis when the app loads (this module loads with lib/api.js).
if (import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search)
  if (params.has('fakeAnalysis')) setFakeAnalysis(params.get('fakeAnalysis'))
  if (getFakeAnalysis()) {
    console.info(`[ReadRight] Analysis is FAKED (dev: ${getFakeAnalysis()}). Open any page with ?fakeAnalysis=0 to use the real backend.`)
  }
}

/** True for fake/sample results — these must never be saved. */
export function isDevSample(result) {
  return result?.dev_sample === true
}

/**
 * Stand-in for the /analyze call: waits, then resolves with the sample
 * "instructional" result (or rejects for 'fail'). Honours the abort signal so
 * useAnalyzeSubmit's timeout / unmount handling behaves normally.
 */
export async function fakeAnalyze(setting, signal) {
  const { sampleResults } = await import('../data/sampleResults')
  const fail = setting === 'fail'
  const ms = fail ? 3000 : (Number(setting) || DEFAULT_SECONDS) * 1000
  await new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
  if (fail) throw new Error('Fake analysis failure (dev)')
  console.info('[ReadRight] Fake analysis (dev) — returning the sample result.')
  return { ...sampleResults.instructional, dev_sample: true }
}
