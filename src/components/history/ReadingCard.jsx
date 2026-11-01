import { Link } from 'react-router-dom'
import { Face } from '../dashboard/DashboardParts'
import { LEVEL_FACES, shortDate } from '../dashboard/dashboardCopy'

/**
 * One past reading: title, date, and the reading-level row. The row links to
 * that reading's full results (`to`, i.e. /history/:sessionId).
 */
export function ReadingCard({ session, title, to }) {
  const face = LEVEL_FACES[session.reading_level]

  return (
    <li className="flex flex-col gap-3 rounded-3xl border-2 border-card-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-black leading-tight">{title}</span>
        <span className="text-base font-bold text-ink-muted">{shortDate(session.session_timestamp)}</span>
      </div>

      <Link
        to={to}
        aria-label={`See results for ${title}${face ? `, ${face.label}` : ''}`}
        className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2 active:translate-y-0.5 ${
          face ? `${face.card} ${face.border} ${face.ink}` : 'border-card-border bg-[#fff9f6] text-ink-soft'
        }`}
      >
        {face && <Face mood={face.mood} size={40} />}
        <span className="min-w-0 flex-1 text-lg font-black leading-tight">{face ? face.label : 'Your reading'}</span>
        <span className="flex shrink-0 items-center gap-1 text-base font-extrabold">
          See results
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </Link>
    </li>
  )
}
