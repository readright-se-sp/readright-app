# ReadRight

Phil-IRI oral reading assessment PWA for Grade 4 Filipino learners.

**Team Code:** 2526-sem2-cs342-11

---

## Getting started (< 10 minutes)

### Prerequisites
- Node.js 20+ (`node -v`)
- Git

### 1. Clone and install

```bash
git clone https://github.com/3WokRide/readright-app.git readright-app
cd readright-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values shared by @infra-dev (from RR-001):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_FASTAPI_URL=      # leave blank until RR-005 is done
VITE_API_KEY=          # leave blank until RR-005 is done
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You should see the LoginPage stub with no console errors.

---

## Project structure

```
src/
  components/    Shared UI components
  pages/         LoginPage, SessionScreen, SessionResultsPage, DashboardPage
  hooks/         GO1 quality check hooks + useSessionHistory
  lib/
    supabase.js  Supabase client (persisted session — stays signed in across reloads)
    api.js       FastAPI /analyze client (STUBBED in RR-003)
  data/
    passages.js  Phil-IRI Grade 4 passage bank (≥4 passages)
public/
  manifest.json  PWA manifest
src/
  sw.js          Service Worker (install-only, no caching per SRS)
```

## Routes

| Path | Page | Status |
|---|---|---|
| `/login` | LoginPage | Stub |
| `/session` | SessionScreen | Stub |
| `/results` | SessionResultsPage | Stub |
| `/dashboard` | DashboardPage | Stub |

## Key constraints (read before implementing)

- **No offline mode** — Service Worker is for PWA installation only
- **Persisted login** — `persistSession: true` in supabase.js keeps the learner signed in across reloads (JWT in localStorage, managed by the SDK; do not hand-roll token storage)
- **api.js is stubbed** — do not call the real FastAPI until RR-005 is deployed
- **Grade 4 only** — do not add other grade levels to passages.js

---

## Deployment

The frontend is a static SPA — deploy it to **Vercel Hobby** or **Cloudflare Pages** (both free).
`vercel.json` already rewrites all routes to `index.html` for client-side routing.

### 1. Build settings
- Build command: `npm run build`
- Output directory: `dist`
- Node: 20+

### 2. Environment variables (set in the host dashboard — never commit)
| Var | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `VITE_FASTAPI_URL` | **HTTPS** base URL of the deployed API (e.g. `https://api.readright.example.com`) — not localhost, not `http://` |
| `VITE_API_KEY` | must match the API's `API_KEY` |

> These are baked into the bundle at build time, so **rebuild/redeploy after changing any of them**.

### 3. CORS must match (both directions)
- The API's `ALLOWED_ORIGINS` must list this site's deployed origin (e.g. `["https://readright.vercel.app"]`).
- `VITE_FASTAPI_URL` must be HTTPS — an HTTPS page cannot call an HTTP API (mixed-content block).

### 4. Security note — `VITE_API_KEY` is public
Anything prefixed `VITE_` is embedded in the shipped JavaScript, so `VITE_API_KEY` is **not secret** —
anyone can read it and call `/analyze` directly. For the pilot this is bounded by the API's
`MAX_CONCURRENCY` gate (extra callers get `503 BUSY`) plus strict CORS. Longer term, replace the
static key with per-learner Supabase-JWT verification at the API (out of scope for the pilot).
