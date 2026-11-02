import { Link } from 'react-router-dom'
import { Face, StoryBook } from '../dashboard/DashboardParts'
import { LEVEL_FACES, shortDate } from '../dashboard/dashboardCopy'

/**
 * One past reading as a book tile, matching the dashboard's "Past readings"
 * last-story tile: cream with a soft tan edge, storybook, date, title and the
 * reading-level badge (face + label). The whole tile links to that reading's
 * full results (`to`, i.e. /history/:sessionId).
 *
 * Each tile is only as tall as its text: the date sits right above the title
 * and the badge right below it. Titles are cut off after two lines; the date
 * and badge never wrap.
 */
export function ReadingCard({ session, title, to }) {
  const face = LEVEL_FACES[session.reading_level]
  const date = shortDate(session.session_timestamp)

  return (
    <li>
      <Link
        to={to}
        aria-label={`See results for ${title}, ${date}${face ? `, ${face.label}` : ''}`}
        className="flex items-center gap-3 rounded-2xl border-[3px] border-cream-edge bg-sticker py-2.5 pl-3.5 pr-2.5 shadow-cream-edge active:translate-y-1 active:shadow-none"
      >
        <StoryBook className="w-14" />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-bold text-tile-blue-ink">{date}</span>
          <span className="mt-0.5 line-clamp-2 break-words text-[24px] font-black leading-tight text-ink">{title}</span>
          <span
            className={`mt-1.5 flex max-w-full items-center gap-1 self-start whitespace-nowrap rounded-full border-2 py-px pl-px pr-2.5 text-sm font-black ${
              face ? `${face.card} ${face.border} ${face.ink}` : 'border-card-border bg-card text-ink-soft'
            }`}
          >
            {face ? <Face mood={face.mood} size={20} /> : <span className="size-5 shrink-0" />}
            <span className="truncate">{face ? face.label : 'See how you did'}</span>
          </span>
        </span>

        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lotus-deep text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </Link>
    </li>
  )
}
