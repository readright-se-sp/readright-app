/**
 * HistoryPage  —  /history route
 *
 * "Past readings" — every past reading, grouped by story grade (highest
 * first) and newest first inside each group. Grade chips filter the list;
 * each card's "See results" opens that reading's full results
 * (/history/:sessionId → ReadingDetailsPage). Opened from
 * the dashboard's "Past readings" card ("See all my readings"); the back
 * button returns to /dashboard.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Loading  "Getting your readings…" while useSessionHistory loads.
 *  Empty    No readings yet → Start Reading (same entry as the dashboard).
 *  Error    "Try again" re-runs the load (retry).
 *
 *  Dev preview (npm run dev only): /history?sample, ?sample=basic|empty|loading|error
 *  — same data as /dashboard?sample (data/sampleDashboard.js).
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → static samples for now (data/sampleData.js).
 *
 *  TODO(passage title) / TODO(passage grade): cards say "Story N", and the
 *  chips and grade headings are hidden, unless sessions carry `passage_title`
 *  / `passage_grade`.
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { sampleDashboard } from '../data/sampleDashboard'
import { GradeChips } from '../components/history/GradeChips'
import { ReadingCard } from '../components/history/ReadingCard'

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

  const groups = groupByGrade(sessions)
  const graded = groups.filter((g) => g.grade != null)
  const shown = filter === 'all' ? groups : groups.filter((g) => g.grade === filter)

  return (
    <div className="min-h-dvh bg-[#f3e4e0] font-display text-ink sm:py-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 bg-[#fff9f6] px-4 pb-8 pt-4 sm:min-h-0 sm:rounded-[32px] sm:border-2 sm:border-[#e3c3bb]">
        <header className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(`/dashboard${sample ? search : ''}`)}
            aria-label="Go back to my dashboard"
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-card-border bg-card text-brand shadow-card active:translate-y-1 active:shadow-none"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[28px] font-black leading-tight">Past readings</h1>
            {ready && (
              <p className="text-lg font-semibold text-ink-soft">
                {sessions.length} {sessions.length === 1 ? 'story' : 'stories'} read
              </p>
            )}
          </div>
        </header>

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

        {!error && loading && (
          <p className="text-base font-bold text-ink-muted" aria-live="polite">
            Getting your readings…
          </p>
        )}

        {ready && sessions.length === 0 && (
          <section className="flex flex-col items-center gap-3.5 px-3 pt-8 text-center">
            <img src="/mascot-reading.svg" alt="" className="w-32 motion-safe:animate-lumi-bob" />
            <p className="max-w-[290px] text-[22px] font-black leading-tight text-balance">No readings yet!</p>
            <p className="max-w-[300px] text-[17px] text-ink-soft">Read your first story and it will show up here.</p>
            <button
              type="button"
              onClick={() => navigate('/pre-session')}
              className="mt-2 flex min-h-[60px] items-center justify-center gap-2.5 rounded-[18px] bg-brand px-8 text-xl font-black text-white shadow-[0_4px_0_#7a1f1b] active:translate-y-1 active:shadow-none"
            >
              <span aria-hidden="true" className="size-0 shrink-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
              Start Reading
            </button>
          </section>
        )}

        {ready && sessions.length > 0 && (
          <>
            {graded.length > 0 && (
              <GradeChips
                total={sessions.length}
                grades={graded.map((g) => ({ grade: g.grade, count: g.rows.length }))}
                value={filter}
                onChange={setFilter}
              />
            )}
            {shown.map((group) => (
              <section key={group.grade ?? 'none'} className="flex flex-col gap-3">
                {graded.length > 0 && (
                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <h2 className="text-[22px] font-black leading-tight">
                      {group.grade != null ? `Grade ${group.grade} stories` : 'More stories'}
                    </h2>
                    <span className="text-base font-bold text-ink-muted">{group.rows.length} read</span>
                  </div>
                )}
                <ul className="flex flex-col gap-3">
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
      </div>
    </div>
  )
}
