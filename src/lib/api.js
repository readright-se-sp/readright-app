/**
 * api.js — ReadRight backend client.
 *
 * Two flows live here until the v1 endpoints are live (store/api-endpoints.md):
 *
 *   Old flow — submitRecording, used while VITE_USE_V1_API is not 'true'. Every
 *   reading finishes with a static sample result (USE_SAMPLE_RESULTS below).
 *
 *   v1 flow — every other function. /v1/* calls send the learner's Supabase
 *   token as `Authorization: Bearer`; the backend takes the learner from it. The
 *   recording goes straight to S3 through a presigned POST, so S3 gets no token.
 *   Never call the X-Backend-Key CRUD routes from the browser.
 *
 * In `npm run dev`, ?fakeAnalysis runs the v1 flow against utils/devPreview.js.
 *
 * Config: VITE_FASTAPI_URL must be the deployed HTTPS base URL (not localhost).
 * These stay pure fetches; timeouts, abort-on-unmount, and the retry-UI state
 * machine live in the useAnalyzeSubmit hook, which passes an AbortSignal in via
 * the `signal` option (RR-050 · REA-34).
 */

import { supabase } from './supabase'
import { sampleResults } from '../data/sampleResults'
import { fakeApi, getFakeAnalysis } from '../utils/devPreview'

// TODO(backend): with the v1 API off, every reading finishes with a static sample
// result, and the recording is not uploaded. Removed with the old flow.
const USE_SAMPLE_RESULTS = true

/** Error that carries the FastAPI failure `code` and HTTP `status` for callers. */
export class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/** True when the app should use the /v1 endpoints instead of the old flow. */
export function isV1Enabled() {
  return import.meta.env.VITE_USE_V1_API === 'true' || !!getFakeAnalysis()
}

/** Throws an ApiError for a non-2xx response, or returns the parsed JSON body. */
async function readResponse(response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const message = typeof err.detail === 'string' ? err.detail : err.error
    throw new ApiError(err.code || 'UNKNOWN_ERROR', message || 'Request failed', response.status)
  }
  return response.json()
}

/** Calls a /v1 endpoint as the signed-in learner. */
async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new ApiError('NOT_SIGNED_IN', 'Not signed in', 401)

  const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
  return readResponse(response)
}

/**
 * Old flow. Removed once the v1 endpoints are live.
 *
 * @param {File|Blob} file              — recording from MediaRecorder (webm or mp4)
 * @param {string}    passageId         — e.g. 'phil-iri-g4-p1'
 * @param {{ signal?: AbortSignal }} [options] — abort signal from useAnalyzeSubmit
 * @returns {Promise<AssessmentResultJSON>}
 * @throws {ApiError} on a non-2xx response
 * @throws {DOMException} 'AbortError' when the signal aborts (timeout/unmount)
 */
export async function submitRecording(file, passageId, { signal } = {}) {
  if (USE_SAMPLE_RESULTS) return { ...sampleResults.instructional, dev_sample: true }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('passage_id', passageId)

  // Do not set Content-Type manually: fetch adds the multipart boundary.
  const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
    method: 'POST',
    headers: { 'X-API-Key': import.meta.env.VITE_API_KEY },
    body: formData,
    signal,
  })
  return readResponse(response)
}

/**
 * POST /v1/me/sessions — picks a passage and creates the session (§5).
 *
 * @param {number|null|undefined} passageGradeId — omitted: the learner's own grade
 * @returns {Promise<{ session_id: string, status: string, passage: { id: string, title: string, text: string, wordCount: number } }>}
 */
export async function startSession(passageGradeId) {
  if (getFakeAnalysis()) return fakeApi.startSession()
  return apiFetch('/me/sessions', {
    method: 'POST',
    body: passageGradeId == null ? {} : { passage_grade_id: passageGradeId },
  })
}

/** Posts the file to S3 with the presigned fields. Resolves false when S3 answers 403. */
async function postToS3(upload, file, signal) {
  const form = new FormData()
  Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value))
  form.append('file', file) // S3 requires the file to be the LAST field

  const response = await fetch(upload.url, { method: 'POST', body: form, signal })
  if (response.status === 403) return false
  if (!response.ok) throw new ApiError('UPLOAD_FAILED', 'Upload failed', response.status)
  return true
}

/**
 * Uploads the recording and starts the analysis: upload-url → S3 → recording (§6).
 * A 403 from S3 means the link expired or was rejected, so it gets one new link.
 *
 * @param {string} sessionId
 * @param {File} file — send file.type exactly as useMediaRecorder produced it
 * @param {number} durationSeconds
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ session_id: string, status: string }>}
 */
export async function uploadRecording(sessionId, file, durationSeconds, { signal } = {}) {
  if (getFakeAnalysis()) return fakeApi.uploadRecording()

  const getLink = () =>
    apiFetch(`/me/sessions/${sessionId}/upload-url`, {
      method: 'POST',
      body: { content_type: file.type },
      signal,
    })

  let link = await getLink()
  if (!(await postToS3(link.upload, file, signal))) {
    link = await getLink()
    if (!(await postToS3(link.upload, file, signal))) {
      throw new ApiError('UPLOAD_REJECTED', 'Upload rejected', 403)
    }
  }

  return apiFetch(`/me/sessions/${sessionId}/recording`, {
    method: 'POST',
    body: {
      storage_key: link.storage_key,
      content_type: file.type,
      size_bytes: file.size,
      duration_seconds: durationSeconds,
    },
    signal,
  })
}

/**
 * GET /v1/me/sessions/{id} — polled until the result is ready (§7).
 *
 * @returns {Promise<{ session_id: string, status: string, analysis_status: string, comprehension_status: string|null }>}
 */
export async function getSessionStatus(sessionId, { signal } = {}) {
  const fake = getFakeAnalysis()
  if (fake) return fakeApi.getSessionStatus(fake)
  return apiFetch(`/me/sessions/${sessionId}`, { signal })
}

/**
 * GET /v1/me/sessions/{id}/questions (§8).
 *
 * @returns {Promise<Array<{ id: string, question: string, options: string[] }>>}
 */
export async function getQuestions(sessionId) {
  if (getFakeAnalysis()) return fakeApi.getQuestions()
  return apiFetch(`/me/sessions/${sessionId}/questions`)
}

/**
 * POST /v1/me/sessions/{id}/comprehension (§8).
 *
 * @param {string} sessionId
 * @param {Array<{ question_id: string, choice: number|'idk'|null }>} answers
 */
export async function submitComprehension(sessionId, answers, { signal } = {}) {
  if (getFakeAnalysis()) return fakeApi.submitComprehension()
  return apiFetch(`/me/sessions/${sessionId}/comprehension`, {
    method: 'POST',
    body: { answers },
    signal,
  })
}

/** GET /v1/me/sessions/{id}/result — the flat result the Results page reads (§9). */
export async function getResult(sessionId, { signal } = {}) {
  if (getFakeAnalysis()) return fakeApi.getResult()
  return apiFetch(`/me/sessions/${sessionId}/result`, { signal })
}

/** GET /v1/dashboard — `sessions` holds flat rows, oldest first (§4). */
export async function getDashboard() {
  return apiFetch('/dashboard')
}
