import { Link } from 'react-router-dom'
import { Star, StoryBook } from './DashboardParts'
import { shortDate } from './dashboardCopy'
import { LilyPad, LotusBud } from '../ui/PondParts'

/**
 * "Past readings" (My shelf) — the last story read, on a blue gingham card
 * with a lily pad and a lotus bud on the water. (The story count is already on
 * the "You've read" card at the top of the dashboard.) Tapping
 * the last story opens its full results (`readingPath(session)`, i.e.
 * /history/:sessionId); "See all my readings" opens the full list on /history.
 *
 * TODO(passage title): the `passages` table has no title yet, so the last
 * story says "Story N" unless the session carries `passage_title`.
 */
export function PastReadings({ sessions, historyPath = '/history', readingPath = (s) => `/history/${s.id}` }) {
  const last = sessions.at(-1)
  const title = last.passage_title ?? `Story ${sessions.length}`
  const date = shortDate(last.session_timestamp)

  return (
    <section className="relative flex flex-col gap-4 overflow-clip rounded-3xl bg-shelf-sky bg-[linear-gradient(90deg,var(--color-shelf-check)_50%,transparent_50%),linear-gradient(var(--color-shelf-check)_50%,transparent_50%)] bg-size-[24px_24px] p-4.5 shadow-shelf-sky">
      {/* White patch behind the title. */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-[180px] w-[340px] rounded-[50%] bg-white" />

      {/* Title stops short of the lily pad. */}
      <div className="relative flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pr-16">
        <span className="rounded-full bg-tile-blue px-3 py-1 text-sm font-black text-white">My shelf</span>
        <h2 className="text-[21px] font-black leading-tight text-shelf-navy">Past readings</h2>
      </div>

      <div className="relative mt-10">
        {/* A lily pad and a lotus bud on the water, anchored to the top of the
            tile so they always sit just above it, whatever the card's width. */}
        <LilyPad className="bottom-full -right-2.5 mb-3 size-[72px]" />
        <LotusBud className="bottom-full right-[70px] mb-1.5 w-11" />
        <Star className="bottom-full right-[134px] mb-2 size-3.5 text-cta" />
        <Link
          to={readingPath(last)}
          aria-label={`See results for your last story, ${title}, ${date}`}
          className="relative flex items-center gap-3 rounded-2xl border-[3px] border-cream-edge bg-sticker py-3 pl-3.5 pr-2.5 shadow-cream-edge active:translate-y-1 active:shadow-none"
        >
          <StoryBook />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-bold text-tile-blue-ink">Last story · {date}</span>
            <span className="text-xl font-black leading-tight text-ink">{title}</span>
          </span>
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lotus-deep text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </Link>
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 -right-2.5 size-2 rounded-full bg-coral" />
      </div>

      {/* White second choice: red stays for Start Reading, the dashboard's main action. */}
      <Link
        to={historyPath}
        className="relative flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-shelf-navy bg-white px-4 text-xl font-black text-shelf-navy shadow-shelf-navy active:translate-y-1 active:shadow-none"
      >
        See all my readings
        <span aria-hidden="true">›</span>
      </Link>
    </section>
  )
}
