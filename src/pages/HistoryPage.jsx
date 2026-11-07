/**
 * HistoryPage  —  /history route
 *
 * "Past readings" — every past reading, grouped by story grade (highest
 * first) and newest first inside each group, each under a "Grade N stories"
 * heading. Grade chips filter the list (only when there are 2+ grades);
 * each book tile opens that reading's full results
 * (/history/:sessionId → ReadingDetailsPage). Opened from
 * the dashboard's "Past readings" card ("See all my readings"); the back
 * button returns to /dashboard.
 *
 * Looks like the dashboard: pond background, frosted sticky navbar (here a
 * sub-page bar: back button + title + profile menu), Lumi intro, and the
 * "My shelf" book tiles (history/ReadingCard), and the same sticky
 * Start Reading bar (dashboard/StartReadingBar) at the bottom.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Start Reading is always shown (sticky), so a reading is one tap away in every state.
 *  Loading  "Getting your readings…" + placeholder tiles while useSessionHistory loads.
 *  Empty    No readings yet → points to Start Reading below.
 *  Error    "Try again" re-runs the load (retry).
 *
 *  Dev preview (npm run dev only): /history?sample, ?sample=basic|empty|loading|error
 *  — same data as /dashboard?sample (data/sampleDashboard.js).
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → GET /v1/dashboard, or static samples
 *           (data/sampleData.js) while VITE_USE_V1_API is off.
 *
 *  TODO(passage grade): the chips and grade headings are hidden unless sessions
 *  carry `passage_grade`. Without `passage_title`, cards say "Story N".
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { sampleDashboard } from '../data/sampleDashboard'
import { PondBackground } from '../components/ui/PondBackground'
import { GlassLayer } from '../components/ui/GlassLayer'
import { StartReadingBar } from '../components/dashboard/StartReadingBar'
import { GradeChips } from '../components/history/GradeChips'
import { ReadingCard } from '../components/history/ReadingCard'
import ProfileMenu from '../components/layout/ProfileMenu'

/**
 * Newest-first rows grouped by story grade, highest grade first. Readings
 * without a grade go last under "More stories". `number` is each reading's
 * place in the full history, for the "Story N" fallback title.
 */
function groupByGrade(sessions) {
  const rows = sessions.map((s, i) => ({ ...s, number: i + 1 })).reverse()
  const groups = new Map()
  for (const row of rows) {
    const key = row.passage_grade ?? 'none'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  return [...groups.entries()]
    .map(([grade, list]) => ({ grade: grade === 'none' ? null : grade, rows: list }))
    .sort((a, b) => (b.grade ?? -1) - (a.grade ?? -1))
}

export default function HistoryPage() {
  const history = useSessionHistory()
  const navigate = useNavigate()
  const { search } = useLocation()
  const [filter, setFilter] = useState('all')

  // Dev-only preview, same as DashboardPage. Production builds never use samples.
  const params = new URLSearchParams(search)
  const sample = import.meta.env.DEV && params.has('sample') ? sampleDashboard(params.get('sample')) : null
  const { sessions, loading, error } = sample ?? history
  const ready = !error && !loading
  const isEmpty = ready && sessions.length === 0

  const groups = groupByGrade(sessions)
  const graded = groups.filter((g) => g.grade != null)
  const shown = filter === 'all' ? groups : groups.filter((g) => g.grade === filter)

  return (
    <div className="relative min-h-dvh font-display text-ink sm:py-6">
      {/* Pond fixed to the screen; the tiles scroll over it. */}
      <PondBackground />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pb-8 pt-3 sm:min-h-[calc(100dvh-3rem)]">
        {/* Sticky navbar, same glass as the dashboard's: bleeds past the
            column's px-4/pt-3 so content scrolls under it. A sub-page bar —
            back button + page title + profile menu, no logo (the logo is the
            dashboard's, the home screen). */}
        <header className="sticky top-0 z-10 -mx-4 -mt-3 flex min-h-12 items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_6px_12px_-8px_rgba(40,80,120,0.25)] sm:rounded-2xl">
          <GlassLayer className="border-b bg-white/85 sm:rounded-2xl sm:border" />
          <button
            type="button"
            onClick={() => navigate(`/dashboard${sample ? search : ''}`)}
            aria-label="Go back"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-cream-edge bg-cream-button text-level-ink shadow-cream-button active:translate-y-0.5 active:shadow-none"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[22px] font-black leading-tight">Past readings</h1>
          {/* Same profile menu as the dashboard, so Sign out is one tap away here too. */}
          <ProfileMenu />
        </header>

        <section className="flex items-center gap-4 px-1 pb-2 pt-4">
          <img src="/mascot-reading.svg" alt="" className="w-[72px] shrink-0 motion-safe:animate-lumi-bob" />
          {ready && sessions.length > 0 ? (
            <p className="text-[22px] font-black leading-tight text-ink">Pick a story and I’ll show you how you did!</p>
          ) : (
            <p className="text-[19px] font-bold leading-snug text-ink-soft">All the stories you read will show up here.</p>
          )}
        </section>

        {error && (
          <section
            role="alert"
            className="flex flex-col items-center gap-3.5 rounded-3xl border-2 border-card-border bg-peach px-5 py-6 text-center shadow-card"
          >
            <img src="/mascot-reading.svg" alt="" className="w-[76px]" />
            <h2 className="text-[22px] font-black">Your readings didn’t load</h2>
            <p className="max-w-[300px] text-[17px] leading-[1.45] text-ink-soft">
              We couldn’t load your past readings. Check your internet and tap Try again.
            </p>
            <button
              type="button"
              onClick={history.retry}
              className="min-h-[52px] min-w-[180px] rounded-2xl border-2 border-brand bg-[#fff9f6] px-6 text-[19px] font-black text-brand shadow-[0_4px_0_#dfbfbc] active:translate-y-1 active:shadow-none"
            >
              Try again
            </button>
          </section>
        )}

        {!error && loading && <HistoryLoading />}

        {isEmpty && (
          <section className="flex flex-col items-center gap-3.5 rounded-3xl border-[3px] border-shelf-edge bg-shelf-card px-5 py-7 text-center shadow-shelf-card">
            <p className="max-w-[290px] text-[22px] font-black leading-tight text-balance text-level-ink">No readings yet!</p>
            <p className="max-w-[300px] text-[17px] text-level-muted">
              Tap Start Reading below to read your first story.
            </p>
          </section>
        )}

        {ready && sessions.length > 0 && (
          <>
            {/* Nothing to filter with a single grade, but its heading still shows. */}
            {graded.length > 1 && (
              <GradeChips
                total={sessions.length}
                grades={graded.map((g) => ({ grade: g.grade, count: g.rows.length }))}
                value={filter}
                onChange={setFilter}
              />
            )}
            {shown.map((group) => (
              <section key={group.grade ?? 'none'} className="flex flex-col gap-3.5">
                {graded.length > 0 && (
                  <div className="flex items-center gap-3 px-1 pt-2">
                    <h2 className="text-[22px] font-black leading-tight">
                      {group.grade != null ? `Grade ${group.grade} stories` : 'More stories'}
                    </h2>
                    <span className="-rotate-3 rounded-full bg-level-pill px-3 py-1 text-sm font-black text-white">
                      {group.rows.length} read
                    </span>
                  </div>
                )}
                <ul className="flex flex-col gap-4">
                  {group.rows.map((s) => (
                    <ReadingCard
                      key={s.id ?? s.session_timestamp}
                      session={s}
                      title={s.passage_title ?? `Story ${s.number}`}
                      to={`/history/${s.id}${sample ? search : ''}`}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        {/* Same sticky Start Reading bar as the dashboard, in every state.
            Must stay last in the column (see StartReadingBar). */}
        <StartReadingBar />
      </div>
    </div>
  )
}

/** Placeholder tiles the same shape as ReadingCard while the history loads. */
function HistoryLoading() {
  return (
    <>
      <p className="px-1 text-base font-bold text-ink-soft" aria-live="polite">
        Getting your readings…
      </p>
      <ul className="flex flex-col gap-4 motion-safe:animate-pulse" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 rounded-3xl border-[3px] border-[#e8cfc4] bg-[#fffaf0] py-3 pl-3.5 pr-2.5">
            <span className="h-12 w-10 shrink-0 rounded-md bg-[#f3e2d6]" />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="h-6 w-14 rounded-lg bg-[#f3e2d6]" />
              <span className="h-11.25 w-3/4 rounded-lg bg-[#f3e2d6]" />
              <span className="h-8.5 w-32 rounded-full bg-[#f3e2d6]" />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
