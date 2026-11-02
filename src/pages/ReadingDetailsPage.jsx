/**
 * ReadingDetailsPage  —  /history/:sessionId route
 *
 * One past reading's full results, opened from a book tile on /history.
 * Shows the same cards as /results (comprehension, Reading Aloud Score,
 * speed, Word Detective, How I Read) under the story's book tile; the back
 * button returns to /history.
 *
 * Looks like /history: pond background, frosted sticky sub-page bar (back
 * button + "My results" + profile menu), and the story as a "My shelf" book tile. The
 * result cards are shared with /results and designed for its peach page, so
 * they sit on a full-width peach sheet that rises over the pond.
 *
 * Unlike /results it never saves anything: it only reads an existing reading.
 * The id is in the URL, so a refresh or bookmark still works.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Loading    "Getting your reading…" + placeholder tile while the history loads.
 *  Error      "Try again" re-runs the load (retry).
 *  Not found  No reading with this id → back to Past readings.
 *
 *  Dev preview (npm run dev only): /history/sample-3?sample — looks the id up
 *  in data/sampleDashboard.js, like /history?sample.
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useReadingResult(sessionId) → static samples + placeholder result
 *           (data/sampleReadingResults.js). TODO(backend): fetch by id.
 */
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { findReading, useReadingResult } from '../hooks/useReadingResult'
import { sampleDashboard } from '../data/sampleDashboard'
import { shortDate } from '../components/dashboard/dashboardCopy'
import { StoryBook } from '../components/dashboard/DashboardParts'
import { PondBackground } from '../components/ui/PondBackground'
import { GlassLayer } from '../components/ui/GlassLayer'
import { ComprehensionCard } from '../components/results/ComprehensionCard'
import { ReadingScoreCard } from '../components/results/ReadingScoreCard'
import { SpeedCard } from '../components/results/SpeedCard'
import { WordDetective } from '../components/results/WordDetective'
import { HowIRead } from '../components/results/HowIRead'
import ProfileMenu from '../components/layout/ProfileMenu'
import { StartReadingBar } from '../components/dashboard/StartReadingBar'

export default function ReadingDetailsPage() {
  const { sessionId } = useParams()
  const reading = useReadingResult(sessionId)
  const navigate = useNavigate()
  const { search } = useLocation()

  // Dev-only preview, same as HistoryPage. Production builds never use samples.
  const params = new URLSearchParams(search)
  const sample = import.meta.env.DEV && params.has('sample') ? sampleDashboard(params.get('sample')) : null
  const { session, number, result, loading, error } = sample ? { ...sample, ...findReading(sample.sessions, sessionId) } : reading
  const historyPath = `/history${sample ? search : ''}`

  return (
    <div className="relative min-h-dvh font-display text-ink sm:py-6">
      {/* Pond fixed to the screen; the cards scroll over it. */}
      <PondBackground />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pb-8 pt-3 sm:min-h-[calc(100dvh-3rem)]">
        {/* Sticky sub-page bar, same as /history: back button + page name + profile menu. */}
        <header className="sticky top-0 z-10 -mx-4 -mt-3 flex min-h-12 items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_6px_12px_-8px_rgba(40,80,120,0.25)] sm:rounded-2xl">
          <GlassLayer className="border-b bg-white/85 sm:rounded-2xl sm:border" />
          <button
            type="button"
            onClick={() => navigate(historyPath)}
            aria-label="Go back to my past readings"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-cream-edge bg-cream-button text-level-ink shadow-cream-button active:translate-y-0.5 active:shadow-none"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="min-w-0 flex-1 truncate text-[22px] font-black leading-tight">My results</span>
          {/* Same profile menu as the dashboard, so Sign out is one tap away here too. */}
          <ProfileMenu />
        </header>

        {error && (
          <section
            role="alert"
            className="mt-2 flex flex-col items-center gap-3.5 rounded-3xl border-2 border-card-border bg-peach px-5 py-6 text-center shadow-card"
          >
            <img src="/mascot-reading.svg" alt="" className="w-[76px]" />
            <h1 className="text-[22px] font-black">Your reading didn’t load</h1>
            <p className="max-w-[300px] text-[17px] leading-[1.45] text-ink-soft">
              We couldn’t load this reading. Check your internet and tap Try again.
            </p>
            <button
              type="button"
              onClick={reading.retry}
              className="min-h-[52px] min-w-[180px] rounded-2xl border-2 border-brand bg-[#fff9f6] px-6 text-[19px] font-black text-brand shadow-[0_4px_0_#dfbfbc] active:translate-y-1 active:shadow-none"
            >
              Try again
            </button>
          </section>
        )}

        {!error && loading && (
          <>
            <p className="px-1 pt-2 text-base font-bold text-ink-soft" aria-live="polite">
              Getting your reading…
            </p>
            <div aria-hidden="true" className="flex items-center gap-3 rounded-3xl border-[3px] border-[#e8cfc4] bg-[#fffaf0] px-3.5 py-3 motion-safe:animate-pulse">
              <span className="h-12 w-10 shrink-0 rounded-md bg-[#f3e2d6]" />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="h-6 w-28 rounded-lg bg-[#f3e2d6]" />
                <span className="h-8 w-3/4 rounded-lg bg-[#f3e2d6]" />
              </span>
            </div>
          </>
        )}

        {!error && !loading && !result && (
          <section className="mt-2 flex flex-col items-center gap-3.5 rounded-3xl border-[3px] border-shelf-edge bg-shelf-card px-5 py-7 text-center shadow-shelf-card">
            <img src="/mascot-reading.svg" alt="" className="w-24" />
            <h1 className="max-w-[290px] text-[22px] font-black leading-tight text-balance text-level-ink">We couldn’t find this reading</h1>
            <p className="max-w-[300px] text-[17px] text-level-muted">Go back to your past readings and pick a story to see its results.</p>
            <button
              type="button"
              onClick={() => navigate(historyPath)}
              className="mt-2 min-h-14 rounded-2xl border-[3px] border-level-edge bg-level-card px-6 text-[19px] font-black text-level-ink shadow-level-button active:translate-y-0.5 active:shadow-none"
            >
              Back to my past readings
            </button>
          </section>
        )}

        {!error && !loading && result && (
          <>
            {/* The story, as the same book tile it was on /history. */}
            <section className="mt-2 flex items-center gap-3 rounded-2xl border-[3px] border-cream-edge bg-sticker px-3.5 py-3 shadow-cream-edge">
              <StoryBook />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-bold text-tile-blue-ink">{shortDate(session.session_timestamp)}</span>
                <h1 className="text-[22px] font-black leading-tight text-balance break-words text-ink">
                  {session.passage_title ?? `Story ${number}`}
                </h1>
              </div>
              {/* The story's grade as a pill in the top-right corner (yellow like the grade filters). */}
              {session.passage_grade != null && (
                <span className="shrink-0 self-start whitespace-nowrap rounded-full bg-track-yellow px-2.5 py-0.5 text-sm font-black text-level-ink">
                  Grade {session.passage_grade}
                </span>
              )}
            </section>

            {/* Peach sheet rising over the pond: the shared /results cards are
                designed for a peach page. Bleeds past the column's px-4/pb-8
                so the cards keep their full /results width. */}
            <div className="-mx-4 -mb-8 mt-1 flex flex-1 flex-col gap-3.5 rounded-t-[32px] border-t-[3px] border-white/80 bg-level-card px-4 pb-8 pt-5 shadow-[0_-6px_16px_-6px_rgba(40,80,120,0.3)] sm:rounded-b-[32px]">
              <ReadingScoreCard score={result.word_recognition_pct} readingLevel={result.reading_level} />
              <ComprehensionCard level={result.comprehension_level} />
              <SpeedCard wpm={result.wpm} />
              <div className="mt-2">
                <WordDetective result={result} />
              </div>
              <div className="mt-2">
                <HowIRead result={result} />
              </div>
              {/* Same sticky Start Reading bar as the dashboard. It sits last in
                  the peach sheet (which has the px-4/pb-8 it bleeds past). */}
              <StartReadingBar />
            </div>
          </>
        )}

        {/* No sheet while loading, on an error or when the reading isn't found:
            the bar goes last in the page column instead, so it's always there. */}
        {!(!error && !loading && result) && <StartReadingBar />}
      </div>
    </div>
  )
}
