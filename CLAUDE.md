# CLAUDE.md — ReadRight Frontend Guide

> ReadRight | Team 2526-sem2-cs342-11 | React.js + TailwindCSS PWA
> This file is the authoritative guide for Claude Code working in this repository.
> Read this file in full before writing, editing, or deleting any code.

---

## Package Manager & Scripts

This project uses **npm**. Do not use yarn, pnpm, or bun.

```bash
npm run dev        # Vite dev server (hot reload, http://localhost:5173)
npm run build      # Production build — Vite (TailwindCSS v4 purges unused utilities automatically)
npm run preview    # Preview production build locally
npm run lint       # ESLint flat config — `eslint .` (ESLint 10, react-hooks + react-refresh)
```

These four are the **only** scripts defined in `package.json`. There is **no test runner configured yet** — `npm test` does not exist and Vitest/RTL are not installed (see the Testing row below). Do not invoke `vite` or `eslint` directly unless debugging a specific tool issue.

---

## Environment Variables

Stored in `.env.local` (gitignored). **Never hardcode these values or commit them.**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FASTAPI_URL=
VITE_API_KEY=
```

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — used to initialise the Supabase JS client in `src/lib/supabase.js`.
- `VITE_FASTAPI_URL` — base URL for the FastAPI AI microservice (e.g., `https://api.readright.example.com`).
- `VITE_API_KEY` — static API key sent as `X-API-Key` header on every POST to `/analyze`. Never send this to Supabase or expose it in component logic. (Canonical name in `.env.example` and `src/lib/api.js` — **not** `VITE_FASTAPI_API_KEY`.)

---

## Tech Stack — Strict Constraints

| Concern | Technology | Constraint |
|---|---|---|
| UI Framework | React 19.1 (functional components + hooks only) | No class components. No React.createClass. |
| Styling | TailwindCSS v4 via `@tailwindcss/vite` | Zero-config — no `tailwind.config.js` needed; unused utilities are purged automatically. Utility classes only. No custom CSS files except `index.css` for base resets. No inline `style={{}}` props unless absolutely unavoidable (e.g., dynamic canvas dimensions). |
| Routing | React Router v7 (`<BrowserRouter>` + `<Routes>`/`<Route>`) | No `<Switch>`. Use `<Routes>` / `<Route>` with `element={}` syntax only. |
| State | React built-in (`useState`, `useReducer`, `useContext`) | No Redux, Zustand, Jotai, or any external state library. |
| Data fetching | `@supabase/supabase-js` SDK + native `fetch` | No Axios, SWR, React Query, or Apollo. Supabase client for all DB/Auth. `fetch` for FastAPI POST only. |
| Charting | Recharts | No Chart.js, D3, or Victory. Recharts only. |
| Build tool | Vite | No CRA, Next.js, or Remix. |
| PWA | Hand-rolled `public/sw.js` (install-only, no caching) registered manually in `src/main.jsx` | Service Worker for install support only. No offline caching, no background sync. Do not add `vite-plugin-pwa`. |
| MediaPipe | `@mediapipe/face_mesh` (WASM, browser-only) — **installed** (`v0.4.1633559619`) | Used in `useCameraCheck` for the GO1 camera/face check — both on `/quality-check` and live during recording via `useRecordingMonitor`. WASM + model assets load from the jsDelivr CDN via `locateFile`. Use only via `useCameraCheck`; gated off whenever not recording. |
| Testing | Vitest + React Testing Library (intended) — **not yet installed/configured** | No `test` script, no test files exist. When tests are added, use Vitest + RTL. No Jest. |

---

## UI/UX Design Rules — Non-Negotiable

These rules apply to every learner-facing screen. Violations are bugs.

### Target User
Filipino Grade 4 learners, ~9–10 years old, using personal mobile devices in a home setting, without adult assistance. Design for this user, not for developers.

### Typography
- Body text: **minimum 16px** on mobile (`text-base` or larger).
- Passage display text: **minimum 18px** (`text-lg` or larger).
- No technical jargon visible to the learner. Never display: "miscue", "ASR", "forced alignment", "JWT", "MediaPipe", "pipeline", "WPM" as a raw acronym without explanation.

### Touch Targets
- Every interactive element (button, toggle, link) must have a minimum touch target of **44×44px**.
- Use `min-h-[44px] min-w-[44px]` utility classes on all interactive elements.

### Color + Accessibility
- All GO1 pass/fail indicators must use **both color and an icon/label** — never color alone.
  - PASS: green + checkmark icon
  - FAIL: red/amber + X icon or warning icon + plain-language guidance text
- Do not rely on color as the sole differentiator for any state anywhere in the app.

### Mobile-First Layout
- Primary layout target: **mobile portrait 360–430px wide**.
- All content accessible without horizontal scroll.
- The passage display must show the full passage text without requiring the learner to scroll during reading.
- Tablet (768px+) and desktop (1280px+) must scale gracefully using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Desktop is not required to have a distinct layout.

### Error Messages
- Every error message must be:
  1. Written in plain, age-appropriate Filipino English.
  2. Specific about what went wrong (no generic "Something went wrong").
  3. Followed by a concrete recovery action the learner can take.
- Examples of non-compliant messages: "Error", "Check failed", "500", "Network error".

### Session Flow Constraint
- The number of learner actions from login to viewing results must not exceed **5 steps**:
  1. Log in
  2. Pass GO1 checks
  3. Tap Record
  4. Tap Stop
  5. View results
- Do not add additional confirmation dialogs, intermediate screens, or required steps beyond these.

---

## Component Structure Conventions

### File Naming
- Components: `PascalCase.jsx` (e.g., `RecordingGate.jsx`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useNoiseCheck.js`)
- Utilities/services: `camelCase.js` (e.g., `supabase.js`)
- Pages: `PascalCase.jsx` in `src/pages/` (e.g., `DashboardPage.jsx`)

### Component Rules
- Functional components only. Export as named exports for non-page components; default export for pages.
- Co-locate component-specific logic in a custom hook where the logic involves side effects or browser APIs.
- Props must be destructured in the function signature.
- No component should own both a browser API side effect (getUserMedia, MediaRecorder, AnalyserNode, Canvas) and rendering logic for a different concern. Separate them.

### Hook Rules
- All browser API access (getUserMedia, Web Audio API, Canvas API, MediaPipe WASM) must live in custom hooks, not inside component render functions.
- Every hook that opens a browser resource must clean up in a `useEffect` return function (stop tracks, disconnect AnalyserNode, close AudioContext, cancel timers).
- `useCameraCheck`, `useLightingCheck`, `useNoiseCheck`, `useMicCheck` must each return `{ status: 'CHECKING' | 'PASS' | 'FAIL', message: string }` — no other shape. (The tri-state enum carries the "still measuring" state a boolean can't.)
- `useQualityGate` aggregates the four check hooks for the one-time `/quality-check` gate and returns `{ allPassed: boolean, checks: CheckState }`.
- `useRecordingMonitor({ audioTrack, videoElement, active })` re-runs the GO1 checks **live during recording** and returns `{ checks, failure, clearFailure }` — it raises `failure` when a check stays bad past its grace window (mic 10s, others 5s) so `SessionScreen` can discard the take and prompt a re-record. It reuses the camera/lighting/noise hooks but swaps `useMicCheck` (which latches) for `useMicActivity` (non-latching silence timer). Checks are gated off (null inputs) whenever `active` is false.
- **Stream ownership is split:** `useMediaStream` is the *only* hook that calls `getUserMedia` and the *only* hook that stops tracks (it owns the combined audio+video stream, the `permissionStatus` state machine, and `errorKind` classification). `useMediaRecorder` and the GO1 check hooks (incl. `useMicActivity`) are *consumers* — they receive the stream/track/element as an argument and must never call `getUserMedia` or stop a track, so the live preview keeps running after a recording stops. See ARCHITECTURE.md → "Media Stream & Permission Flow".
- **Skip the gate when already permitted:** on mount `useMediaStream` probes the Permissions API for `camera` + `microphone`. If **both** are already `granted`, it acquires the stream silently via the `checking` state (no learner tap), so `/quality-check` shows the live camera and `/session` jumps straight to recording. The `permissionStatus` machine has five states — `checking` → `pending` → `requesting` → `granted` / `denied`. The native prompt still only fires from `requestStream()` after a tap (the explanation-before-prompt invariant): `requesting` is reserved for that post-tap path, so the auto-acquire path uses `checking` and never flashes the explainer. Any uncertain probe (Firefox `TypeError`, Safari no-API, state `prompt`) falls back to `pending`. `PrePermissionScreen` (`/pre-session`, "Before we start!") is where the learner turns camera + mic on: it uses `useMediaStream` (`requestStream` after a tap) and navigates to `/quality-check` with `state.devicesReady`. Unmounting releases the stream; `/quality-check` has no enable button — on `pending` it auto-calls `requestStream()` when `devicesReady` is set, otherwise redirects to `/pre-session`.

### Current Implementation Status (snapshot — verify against the tree before relying on it)

Several rules above describe the *target* architecture. As of this writing the actual `src/` tree is partway there:

- **Implemented:** `useMediaStream`, `useMediaRecorder`, `useAnalyzeSubmit` (FastAPI POST state machine — AbortController + 120s timeout + abort-on-unmount), all four GO1 check hooks (each returns `{ status: 'CHECKING' | 'PASS' | 'FAIL', message }`: `useCameraCheck` — face-mesh check that dynamically imports `@mediapipe/face_mesh`, auto-passes on a 10s WASM-load timeout or load failure, with forgiving centering/proximity thresholds so the face need not fill the oval guide; `useMicCheck` — Web Audio amplitude that latches to PASS once it hears one clear in-range sample and then stays passed, so the learner can go quiet again; `useNoiseCheck` — Web Audio ambient-noise floor; `useLightingCheck` — Canvas luminance), `useMicActivity` (non-latching recording-time mic silence timer), `useQualityGate` (aggregates the four checks for `/quality-check` → `{ allPassed, checks }`), `useRecordingMonitor` (live GO1 watchdog during recording → `{ checks, failure, clearFailure }`), `useSessionStorage` (wraps `saveSessionRecord` with a StrictMode once-guard → `{ saveStatus }`), `useAuth` (+ `AuthContext`/`AuthGuard`/`useCurrentUser`), `useSessionHistory`, `useReadAloud` (Web Speech read-aloud for quiz questions), `useComprehensionQuiz` (**placeholder** questions, `TODO(quiz questions)` — to be fetched from Supabase per passage), `usePassage` (fetches the passage bank from Supabase + random pick → `{ passage, loading, error, retry }`), `lib/supabase.js` (client + `saveSessionRecord` + `fetchPassages` — the `passages` table is the single source of truth; there is no local passage bank), `lib/api.js` (real `submitRecording` fetch), `lib/philIri.js`, `lib/dashboardStats.js`, `utils/platform.js`, all seven pages (`LoginPage`, `RegisterPage`, `PrePermissionScreen`, `QualityCheckScreen`, `SessionScreen`, `SessionResultsPage`, `DashboardPage`), and the `quality/` (`CameraPreview`, `PermissionExplainer`, `PermissionDenied`), `session/` (`RecordingStatus` — the "Recording 0:42" pill / fix-it tip beside the camera bubble while recording; `ProcessingScreen` — "Analyzing your reading…"; `LeaveSessionDialog` — "Stop reading now?" confirm when leaving during recording or the quiz), `quiz/` (`ComprehensionQuiz` + its intro/question/review/done screens, shown inside `/session` after "I'm done!" while the analysis runs), `results/`, `dashboard/`, `ui/`, and `layout/` component folders.
- **Stubs / fake data:** none in `lib/api.js` anymore — `submitRecording()` performs the real FastAPI `POST /analyze`. (The `/results` page keeps a dev-only fallback that calls `submitRecording` directly when reached without route state.)
- **Referenced in docs but not yet created:** of the components older docs name for `src/components/session/` (`RecordingGate`/`ProcessingScreen`/`PassageDisplay`/`CheckIndicator`), only `ProcessingScreen` exists — the GO1 `CheckIndicator` lives inline in `pages/QualityCheckScreen.jsx`. ARCHITECTURE.md's folder tree was refreshed to match the real `src/` (2026-05); even so, trust the real tree over any document. (`utils/readingLevel.js` from older docs is actually `lib/philIri.js`.)

### Styling Rules
- Use Tailwind utility classes directly on JSX elements.
- The design palette lives in `src/index.css` as a Tailwind v4 `@theme` block (e.g. `--color-brand` `#a5352d`, `--color-goal`, `--color-ink`, `--color-card-border`, `--shadow-card`, and `--font-display: 'Nunito Sans'`). Use the generated semantic utilities — `bg-brand`, `text-ink`, `border-card-border`, `shadow-card`, `font-display` — instead of hardcoded hex values. Change colors in `@theme`, not in markup.
- Do not create `*.module.css` files.
- Do not use `@apply` in CSS except for base-reset rules in `index.css`.
- Responsive classes must use mobile-first prefixes: write base styles for mobile, override with `sm:`, `md:`, `lg:`.

---

## Security Rules

- The login session **persists** so a learner stays signed in across reloads and tab restarts (UX decision — supersedes the former "memory-only JWT" rule, NFR-S3). This is configured via `persistSession: true` in `src/lib/supabase.js`; the Supabase JS SDK stores the token in `localStorage` by default. **Let the SDK own that storage — do not write custom token-storage logic** and do not change the storage mechanism without revisiting this rule. Accepted trade-off: a `localStorage` token is readable by page scripts (XSS exposure); httpOnly cookies are not available for this serverless SPA.
- **Never** send the learner's JWT to FastAPI. The `/analyze` endpoint only receives the MP4 file and `passage_id`.
- **Always** attach `X-API-Key: ${import.meta.env.VITE_API_KEY}` to every fetch POST to FastAPI.
- **Never** commit `.env.local` or any file containing real keys.
- All Supabase DB operations must go through the `@supabase/supabase-js` client, which automatically attaches the Bearer JWT. Do not manually construct Authorization headers for Supabase requests.

---

## Performance Requirements

- Production build must use **code splitting** for non-critical routes so `DashboardPage` is not bundled with the session recording interface. Current state: vendor splitting only — `vite.config.js` uses `build.rollupOptions.output.manualChunks` to split `vendor` (react/react-dom/react-router-dom), `supabase`, and `recharts`. Per-route `React.lazy()` + `<Suspense>` is **not yet implemented** (`App.jsx` eagerly imports all six pages); add it when route-level splitting is needed.
- TailwindCSS v4 purges unused utilities automatically based on source-file scanning by `@tailwindcss/vite` — no `tailwind.config.js` or `content` array is required.
- Session Results page must render within **3 seconds** of receiving FastAPI JSON.
- Dashboard must load all charts within **5 seconds** (up to 50 sessions).
- PWA must be interactive within **5 seconds** on mid-range Android (4G LTE).

---

## What Claude Code Must NOT Do

- Do not install any package not already listed in `package.json` without explicit instruction.
- Do not create a `pages/` directory using Next.js App Router conventions — this is a Vite + React Router SPA.
- Do not implement offline caching in the Service Worker.
- Do not add any teacher, admin, or multi-role UI. There is exactly one user role: Learner. (A learner self sign-up / registration flow is in scope — it is not a second role.)
- `LoginPage`'s "Join ReadRight" link goes to `/register` → `RegisterPage` (learner self sign-up via `signUp` in `useAuth`; profile stored in Supabase Auth `user_metadata`). "Forgot?" (password recovery) is still an inert **stub** `type="button"` — do not present it as a working flow. Wiring it up means adding the route in `App.jsx`, a page under `src/pages/`, and `resetPasswordForEmail` in a hook (see ARCHITECTURE.md → "Planned (stubbed) routes").
- Do not persist any assessment data to localStorage as a primary storage mechanism.
- Do not mock or stub Supabase calls in production code paths.
- Do not add loading spinners or skeleton screens that block the GO1 checks or the passage display — the GO1 four-check panel (on `/quality-check`) and the live camera preview must be visible and live as soon as the camera stream is available.