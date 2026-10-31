# ARCHITECTURE.md — ReadRight Frontend Architecture

> Concise reference for the React.js PWA frontend of ReadRight.
> Three-tier system: React PWA → FastAPI AI Microservice → Supabase (Auth + PostgreSQL).

---

## System Overview

```
Browser (React PWA)
  │
  ├─ getUserMedia / MediaRecorder / Web Audio / Canvas / MediaPipe WASM
  │    (GO1 quality checks — client-side only, never transmitted)
  │
  ├─── HTTPS POST multipart/form-data (MP4 + passage_id)
  │         └─► FastAPI /analyze
  │                  └─► GO2 (WhisperX ASR, MiscueClassifier, ScoringEngine)
  │                  └─► GO3 (MediaPipe CV, librosa, Parselmouth) [parallel]
  │                  └─► Supabase INSERT sessions (direct write)
  │                  └─► Returns AssessmentResultJSON to frontend
  │
  └─── HTTPS REST via @supabase/supabase-js SDK (Bearer JWT)
            └─► Supabase Auth (login, token refresh)
            └─► Supabase PostgREST (sessions table INSERT + SELECT)
```

The FastAPI microservice writes the session record to Supabase directly on pipeline completion. The frontend does **not** relay results through itself for storage — it writes the same record independently via `useSessionStorage` (UC-4.2) as a reliability layer.

---

## Folder Structure

```
readright-app/
├── public/
│   ├── manifest.json           # PWA Web App Manifest (name, icons, display: standalone)
│   ├── sw.js                   # Hand-rolled install-only Service Worker (network passthrough, no caching)
│   └── icons/                  # PWA home screen icons (192px, 512px)
├── src/
│   ├── main.jsx                # React DOM root, router setup
│   ├── App.jsx                 # Route definitions (createBrowserRouter)
│   ├── index.css               # Tailwind v4 entry (@import "tailwindcss";) + base resets only
│   │
│   ├── lib/
│   │   ├── supabase.js         # Supabase client + saveSessionRecord (INSERT + 3x backoff retry) + fetchPassages (SELECT passages)
│   │   ├── api.js              # FastAPI /analyze client — pure submitRecording(file, passageId, {signal})
│   │   ├── philIri.js          # Phil-IRI level / word-recognition mapping (this is the old "readingLevel")
│   │   └── dashboardStats.js   # Aggregates session history into dashboard chart series
│   │
│   ├── pages/                  # One file per route — all eagerly imported (no React.lazy yet)
│   │   ├── LoginPage.jsx            # /login
│   │   ├── PrePermissionScreen.jsx  # /pre-session — probe grant, stop probe tracks → /quality-check
│   │   ├── QualityCheckScreen.jsx   # /quality-check — GO1 four-check gate (useQualityGate) → /session
│   │   ├── SessionScreen.jsx        # /session — permission gate + passage + record/stop + inline processing
│   │   ├── SessionResultsPage.jsx   # /results — results display + useSessionStorage
│   │   └── DashboardPage.jsx        # /dashboard — personal progress (trend charts + panels)
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.jsx           # Redirects unauthenticated users to /login
│   │   ├── quality/                    # (no QualityCheckPanel — the page composes these directly)
│   │   │   ├── CameraPreview.jsx       # Live mirrored <video>; pure stream consumer (optional onVideoNode reports the node up for /session checks)
│   │   │   ├── PermissionExplainer.jsx # In-app camera/mic explanation shown BEFORE native prompt
│   │   │   └── PermissionDenied.jsx    # Device-specific recovery screen (switches on errorKind + platform)
│   │   ├── session/
│   │   │   ├── RecordingStatus.jsx     # Beside the camera bubble while recording: "Recording 0:42" pill, or a fix-it tip when a live check fails
│   │   │   ├── ProcessingScreen.jsx    # "Analyzing your reading…" step screen (shown after the quiz if the analysis is still running)
│   │   │   └── LeaveSessionDialog.jsx  # "Stop reading now?" — confirm before leaving during recording or the quiz
│   │   ├── quiz/                       # Comprehension quiz, rendered inside /session after "I'm done!" while /analyze runs
│   │   │   ├── ComprehensionQuiz.jsx   # Screen flow: intro → questions → review → done → onFinish(answers)
│   │   │   ├── QuizIntro.jsx / QuizQuestion.jsx / QuizReview.jsx / QuizDone.jsx
│   │   │   ├── QuizParts.jsx           # Shared page/card/button/icon pieces
│   │   │   └── quizLabels.js           # Learner-facing labels + grade → text-size tier
│   │   ├── results/
│   │   │   ├── ReadingLevelCard.jsx    # Reading-level badge card
│   │   │   ├── StatCard.jsx            # WPM / word-recognition stat tile
│   │   │   ├── MiscueBreakdown.jsx     # Miscue type counts
│   │   │   ├── ReadingHabits.jsx       # Phil-IRI behavioral flags (habit-improvement framing)
│   │   │   └── ResultsSkeleton.jsx     # Loading skeleton for the results page
│   │   ├── dashboard/
│   │   │   ├── ProfileHeaderCard.jsx        # Learner profile header
│   │   │   ├── StatsSummaryCard.jsx         # Summary stats card
│   │   │   ├── ReadingLevelChart.jsx        # Recharts reading-level trend
│   │   │   ├── WpmChart.jsx                 # Recharts WPM progression + benchmark lines
│   │   │   ├── MiscueBreakdownChart.jsx     # Recharts miscue breakdown (aggregated)
│   │   │   ├── BehavioralHistoryTable.jsx   # Behavior rows with flagged-count indicators
│   │   │   ├── AchievementsSection.jsx      # Achievements / badges
│   │   │   ├── EmptyState.jsx               # No-sessions-yet state
│   │   │   ├── ErrorState.jsx               # Fetch-failure state
│   │   │   └── DashboardSkeleton.jsx        # Loading skeleton for the dashboard
│   │   ├── layout/
│   │   │   ├── AppHeader.jsx           # Shared app header
│   │   │   └── PageShell.jsx           # Page container / layout wrapper
│   │   ├── ui/                         # Shared primitives:
│   │   │   └── Avatar.jsx · Badge.jsx · Button.jsx · Card.jsx · Skeleton.jsx
│   │   └── icons.jsx                   # Shared inline SVG icon components
│   │
│   ├── hooks/
│   │   ├── useNoiseCheck.js        # Web Audio AnalyserNode — ambient noise → { status, message }
│   │   ├── useLightingCheck.js     # Canvas API luminance → { status, message }
│   │   ├── useCameraCheck.js       # MediaPipe Face Mesh WASM — face centered + angle → { status, message }
│   │   ├── useMicCheck.js          # Web Audio amplitude; latches PASS once heard → { status, message }
│   │   ├── useMicActivity.js       # Web Audio amplitude; non-latching silence timer (FAIL after 10s quiet) → { status, message }
│   │   ├── useQualityGate.js       # Aggregates the 4 check hooks for /quality-check → { allPassed, checks }
│   │   ├── useRecordingMonitor.js  # Live GO1 watchdog during recording → { checks, failure, clearFailure }
│   │   ├── useMediaStream.js       # getUserMedia + permission state + stream lifecycle (ONLY track.stop caller)
│   │   ├── useMediaRecorder.js     # MediaRecorder + blob only — consumes useMediaStream, never stops tracks
│   │   ├── useAnalyzeSubmit.js     # FastAPI POST state machine — AbortController, 120s timeout, abort-on-unmount
│   │   ├── useSessionStorage.js    # Wraps saveSessionRecord — StrictMode once-guard → { saveStatus }
│   │   ├── useSessionHistory.js    # Supabase SELECT sessions ORDER BY session_timestamp ASC
│   │   ├── usePassage.js           # Fetches passages from Supabase (fetchPassages) + random pick → { passage, loading, error, retry }
│   │   ├── useComprehensionQuiz.js # PLACEHOLDER quiz questions → { questions, loading, error } (to be fetched from Supabase per passage)
│   │   ├── useReadAloud.js         # Web Speech API read-aloud for quiz text → { supported, playing, readingIdx, play, stop }
│   │   ├── useCurrentUser.js       # Resolves signed-in user → { user, displayName, initial }
│   │   └── useAuth.js              # Supabase Auth state (session, user, signIn, signOut)
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Provides auth state via useAuth; wraps entire app
│   │
│   ├── data/
│   │   └── rename_me_review_me.js  # ⚠️ Unused leftover — slated for removal
│   │                               # (passages now come from Supabase via lib/supabase.js → fetchPassages)
│   │
│   └── utils/
│       └── platform.js             # Coarse iOS/Android/other UA detection — selects PermissionDenied copy
│
├── .env.local                      # Gitignored. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
│                                   #   VITE_FASTAPI_URL, VITE_API_KEY
├── index.html
├── vite.config.js                  # Vite config — @vitejs/plugin-react + @tailwindcss/vite (no vite-plugin-pwa)
└── package.json                    # Tailwind v4 is zero-config — no tailwind.config.js or postcss.config.js
```

---

## Routing

Defined in `src/App.jsx` using `<BrowserRouter>` + `<Routes>` / `<Route>` (React Router). `BrowserRouter` is mounted in `src/main.jsx`. The `createBrowserRouter` data-router API is not used — the app has six flat routes with no loaders or deferred data, so the simpler component API is sufficient.

| Path | Component | Guard |
|---|---|---|
| `/login` | `LoginPage` | Redirect to `/pre-session` if already authenticated |
| `/pre-session` | `PrePermissionScreen` | `AuthGuard` — probes for the grant, stops the probe stream, then forwards to `/quality-check` |
| `/quality-check` | `QualityCheckScreen` | `AuthGuard` — GO1 four-check gate; forwards to `/session` once all pass |
| `/session` | `SessionScreen` | `AuthGuard` — redirect to `/login` if unauthenticated |
| `/results` | `SessionResultsPage` | `AuthGuard` — redirect to `/login`; redirect to `/session` if no result state |
| `/dashboard` | `DashboardPage` | `AuthGuard` — redirect to `/login` |
| `/` and `*` | Redirect → `/login` | — |

All pages are **eagerly imported** today — per-route `React.lazy()` + `<Suspense>` splitting is **not yet implemented** (only vendor chunk-splitting is configured in `vite.config.js`). The learner flow runs `/login → /pre-session → /quality-check → /session → /results`, with `/dashboard` reachable from the results page.

Navigation after submission: `SessionScreen` navigates to `/results` using `useNavigate`, passing the result via React Router `state` (`navigate('/results', { state: { result, passage, isFirstSession } })`). `SessionResultsPage` reads it with `useLocation().state` (`result`, `passage`, `isFirstSession`).

### Planned (stubbed) routes

`LoginPage` renders two secondary actions. Registration is wired up; password recovery is still a **stub** (UI only, no route/handler):

| Trigger (LoginPage) | Intended destination | Status |
|---|---|---|
| "Join ReadRight" (registration link) | `/register` → `RegisterPage` | **Implemented** — `<Link>` to `RegisterPage`, which calls `signUp` from `useAuth` (via `AuthContext`). Full name / grade / age are stored as Supabase Auth `user_metadata` (`display_name`, `grade_level`, `age`). |
| "Forgot?" (password recovery) | `/forgot-password` → recovery flow | Stub — button has no `onClick`/route. No recovery flow exists. |

"Forgot?" is still an inert `type="button"`. Wiring it up requires adding the route in `src/App.jsx`, the page under `src/pages/`, and the corresponding Supabase Auth call (`resetPasswordForEmail`) in a hook. Until then, do not present it as a working flow.

---

## Global State Management

**No external state library.** State is managed at three levels:

1. **Auth state** — `AuthContext` (React Context + `useAuth` hook). Wraps the entire app. Provides `{ session, user, signIn, signOut, loading }`. All components access auth via `useAuth()`.

2. **Session/GO1 state** — Local to `SessionScreen` and its children. `useQualityGate` aggregates the four check hooks for the `/quality-check` gate; `useRecordingMonitor` re-runs them live during recording and raises a `failure` on sustained quality loss. `useMediaStream` owns the stream + permission state machine; `useMediaRecorder` consumes that stream and manages the recorded blob. `useAnalyzeSubmit` manages the FastAPI POST state machine. These are not lifted above `SessionScreen`.

3. **Results state** — Passed via React Router navigation state from `SessionScreen` → `SessionResultsPage`. Not persisted in context. If the learner navigates directly to `/results` without state, redirect to `/session`.

4. **Dashboard data** — Fetched on mount by `useSessionHistory` inside `DashboardPage`. Not cached globally between navigations. Re-fetches on each mount.

---

## Data Fetching & API Integration Patterns

### Supabase (Auth + Database)

Initialised once in `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,    // stay signed in across reloads (localStorage, SDK-managed)
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)
```

All hooks import `supabase` from this module. Never instantiate a second client. The session persists to `localStorage` (SDK default), so a reload keeps the learner authenticated — `AuthGuard` (below) relies on this.

**Auth:**
```js
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
// Sign out
await supabase.auth.signOut()
// Listen for auth changes (in useAuth)
supabase.auth.onAuthStateChange((event, session) => { ... })
```

**INSERT session record (useSessionStorage):**
```js
const { error } = await supabase.from('sessions').insert([record])
// Retry up to 3 times with exponential backoff on error
// On final failure: return { saveStatus: 'failed', error: error.message }
// ResultsPage must still render even on failure — show save-failure banner
```

**SELECT session history (useSessionHistory):**
```js
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('learner_id', user.id)
  .order('session_timestamp', { ascending: true })
```

This single fetch serves both UC-4.3 (Trend Charts) and UC-4.4 (Miscue + Behavioral panels). No duplicate query.

### FastAPI AI Microservice

The network call is a pure function in `lib/api.js` (`submitRecording(file, passageId, { signal })`); the `useAnalyzeSubmit` hook wraps it with the AbortController, the 120s timeout, abort-on-unmount, and the `idle → submitting → success/error/timeout` state machine. The pure call:
```js
const formData = new FormData()
formData.append('file', file)
formData.append('passage_id', passageId)

const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
  method: 'POST',
  headers: { 'X-API-Key': import.meta.env.VITE_API_KEY },
  body: formData,
  signal,            // supplied by useAnalyzeSubmit (120s timeout / unmount abort)
})
```

- **Never** send the learner's JWT to FastAPI.
- On HTTP 500: display plain-language error, offer Re-record option.
- On `AbortError` (timeout at 120s): display timeout message, offer Retry or Re-record.

### AssessmentResultJSON Shape

The JSON returned by FastAPI and used by `ResultsPage`:
```ts
{
  wpm: number,
  word_recognition_pct: number,
  reading_level: 'Frustration' | 'Instructional' | 'Independent',
  correct: number,
  mispronunciation: number,
  substitution: number,
  omission: number,
  insertion: number,
  repetition: number,
  refusal_to_pronounce: number,
  finger_pointing: boolean,
  loss_of_place: boolean,
  monotone_reading: boolean,
  word_by_word_reading: boolean,
  inaudible_reading: boolean,
}
```

---

## Browser APIs — Usage Constraints

| API | Used in | Active during | Notes |
|---|---|---|---|
| `getUserMedia` | `useMediaStream` | GO1 + Recording | One combined audio+video stream; the only `getUserMedia` caller and the only place tracks are stopped |
| `MediaRecorder` | `useMediaRecorder` | Recording only | Consumes the `useMediaStream` stream; MIME: `video/mp4` (iOS), `video/webm;codecs=vp8,opus` (Android/Chrome) |
| `Web Audio API (AnalyserNode)` | `useNoiseCheck`, `useMicCheck`, `useMicActivity` | GO1 + Recording | Close the AudioContext on cleanup. `useMicCheck` runs on /quality-check; `useMicActivity` is its non-latching recording-time counterpart |
| `Canvas API` | `useLightingCheck` | GO1 + Recording | Off-screen `<canvas>` element; sample every 500ms |
| `MediaPipe Face Mesh (WASM)` | `useCameraCheck` | GO1 + Recording | Also runs during recording, driven by `useRecordingMonitor` (gated off when not recording) |

All browser API hooks must clean up all resources in their `useEffect` return.

### Media Stream & Permission Flow

`getUserMedia` ownership is split across two hooks so the live preview and GO1 checks keep running after a recording stops:

- **`useMediaStream`** is the *acquisition + permission + lifecycle* layer. It is the **only** hook that calls `getUserMedia` and the **only** hook that stops tracks. It returns `{ stream, audioTrack, videoTrack, permissionStatus, errorKind, requestStream, retry }`.
- **`useMediaRecorder`** and the GO1 check hooks (`useCameraCheck` / `useMicCheck` / `useMicActivity` / `useNoiseCheck` / `useLightingCheck`) are **consumers** of that stream. They must never call `getUserMedia` and never stop a track.

On mount, `useMediaStream` first probes the Permissions API (`navigator.permissions.query` for both `camera` and `microphone`). If **both** are already `granted` from a prior visit, it acquires the stream **silently** — staying in `checking` until the stream resolves — so a returning learner skips the explanation gate and lands straight on the camera/recording UI. The probe returns "already granted" only when confident: Firefox throws a `TypeError` for these permission names and Safari may lack the API, and every uncertain case (including state `prompt`) falls back to `pending`, preserving the explanation-before-prompt guarantee below.

The native permission prompt only ever fires from `requestStream()` (the public wrapper for the internal `acquire('requesting')`), which the UI triggers from `PermissionExplainer` after a learner tap — guaranteeing the plain-language explanation shows **before** the browser prompt. The silent pre-granted path uses `acquire('checking')` instead, so `requesting` (and the explainer's "Asking…") is reserved exclusively for the post-tap path.

`permissionStatus` drives which screen `SessionScreen` renders:

| `permissionStatus` | Meaning | Screen |
|---|---|---|
| `checking` | Probing existing permission on mount (and silently acquiring if pre-granted) | Quiet "Preparing camera…" placeholder — never the explainer |
| `pending` | Not pre-granted; explanation shown, awaiting the learner's tap | `PermissionExplainer` |
| `requesting` | `getUserMedia` in flight after a learner tap (native prompt open) | `PermissionExplainer` (button disabled) |
| `granted` | Stream active | Passage + `CameraPreview` + record/stop |
| `denied` | Acquisition failed | `PermissionDenied` (recovery steps) |

`QualityCheckScreen` keys off the same `permissionStatus`: it shows the live camera on `granted`, the "Enable Camera & Mic" button on `pending`, the "Preparing camera…" placeholder for `checking`/`requesting`, and the shared `PermissionDenied` on `denied`. Reaching `/quality-check` via `PrePermissionScreen` (which probes for the grant then **stops its probe stream's tracks immediately**) therefore lands on a live preview with no manual tap.

On failure, the raw `DOMException` never leaves `useMediaStream` — it is mapped to a stable, jargon-free `errorKind` that `PermissionDenied` switches on (with `platform` from `utils/platform.js` for the permission case):

| `errorKind` | Mapped from | Recovery copy |
|---|---|---|
| `permission` | `NotAllowedError`, `SecurityError` | Re-enable camera & mic (iOS Safari vs Android Chrome steps) |
| `notfound` | `NotFoundError`, `OverconstrainedError` | No camera on this device |
| `inuse` | `NotReadableError`, `TrackStartError`, `AbortError` | Camera busy / revoked mid-session |
| `insecure` | `mediaDevices` unavailable (non-HTTPS origin) | Open ReadRight over https |
| `unknown` | anything else | Generic "Try Again" |

### Real-Time Recording Monitoring

The GO1 checks don't stop once recording begins — `SessionScreen` keeps watching the environment so a recording we already know is unusable is never uploaded. `useRecordingMonitor({ audioTrack, videoElement, active })` composes the four checks and returns `{ checks, failure, clearFailure }`:

- It **reuses** `useCameraCheck` / `useLightingCheck` / `useNoiseCheck` unchanged, and swaps `useMicCheck` (which latches PASS for the one-time gate) for **`useMicActivity`** — a non-latching counterpart that tracks time-since-last-loud-sample and FAILs after a continuous silence window. The silence window lives inside that hook because silence is a *duration*, not an instantaneous state (normal reading pauses between words would flap a downstream timer).
- Checks run **only while `active`** (i.e. recording). The monitor passes `null` inputs when inactive, relying on each leaf hook's `if (!input) return` guard to fully tear down MediaPipe + AudioContexts — no background CPU cost when idle.
- A per-check **watchdog** arms a timer while a check reads `FAIL` and cancels it the moment the check returns to PASS/CHECKING, so only a *sustained* failure trips. Grace windows: mic 10s (enforced inside `useMicActivity`), camera / lighting / ambient-noise 5s each, plus a short startup cushion for the video checks so MediaPipe warm-up at the start of a take isn't counted. A `firedRef` latch raises exactly one `failure` per take.
- On `failure`, `SessionScreen` **captures the reason first** (the monitor clears its own `failure` once recording stops), then stops the recorder and **discards** the file — it does not submit. The learner sees the specific reason and a "Try again" button (`handleStart` calls `clearFailure()` so a stale failure can't re-fire). During recording the camera preview shrinks to a corner bubble (green ring + ✓ when all checks pass; amber, pulsing, + ! when one fails) and `components/session/RecordingStatus.jsx` shows a "Recording" timer pill or the failing check's fix-it tip — state is never colour alone. This keeps the failure → re-record loop within the 5-step session-flow constraint.

---

## PWA Configuration

- Hand-rolled Service Worker at `public/sw.js`, registered in `src/main.jsx` after window `load`. No build-tool PWA plugin is used; `vite-plugin-pwa` is intentionally avoided because its default precaching behavior conflicts with the SRS requirement that there be **no offline caching**.
- Service Worker purpose: **home screen installation only**. The `fetch` handler is a passthrough to the network. No caches are populated. No background sync. No push notifications.
- `public/manifest.json` is referenced from `index.html` via `<link rel="manifest">`. It must include: `name`, `short_name`, `display: "standalone"`, `start_url`, `background_color`, `theme_color`, and at least two icon sizes (192px, 512px). Icon files live at the `public/` root and are referenced with absolute paths (e.g. `/icon-192.png`, `/icon-512.png` — there is **no** `icons/` subfolder). Note: the manifest's `theme_color` is currently `#1D4ED8` (blue), which does **not** match the brand red (`--color-brand` `#a5352d`) — reconcile if brand consistency is required.
- PWA requires HTTPS at all times. `getUserMedia`, Service Worker registration, and JWT security all depend on a secure origin.

---

## Sessions Table Schema (Reference)

19 columns. Frontend reads all 19 for the dashboard. Frontend writes all 19 via `useSessionStorage`.

`session_id` (UUID PK) · `learner_id` (UUID FK) · `passage_id` (VARCHAR) · `session_timestamp` (TIMESTAMPTZ) · `wpm` (FLOAT) · `word_recognition_pct` (FLOAT) · `reading_level` (VARCHAR) · `correct` · `mispronunciation` · `substitution` · `omission` · `insertion` · `repetition` · `refusal_to_pronounce` (all INTEGER) · `finger_pointing` · `loss_of_place` · `monotone_reading` · `word_by_word_reading` · `inaudible_reading` (all BOOLEAN)

RLS: `SELECT` / `INSERT` only where `auth.uid() = learner_id`.

---

## Passages Table Schema (Reference)

The `passages` table is the **single source of truth** for available reading passages — the frontend no longer ships a hardcoded bank. 4 columns:

`id` (UUID PK) · `text` (TEXT) · `word_count` (INTEGER) · `created_at` (TIMESTAMPTZ)

There is **no `title` column** — the session screen shows a static heading. The frontend reads passages via `lib/supabase.js → fetchPassages` (`SELECT id, text, word_count ORDER BY created_at`), wrapped by the `usePassage` hook which picks one at random per session. `passage.id` (the UUID) is what flows on to `/analyze` as `passage_id` and into the `sessions.passage_id` column.

RLS: `SELECT` allowed for the learner.