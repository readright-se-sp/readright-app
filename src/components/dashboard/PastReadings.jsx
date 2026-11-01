import { Link } from 'react-router-dom'
import { DashboardCard } from './DashboardParts'
import { shortDate, storiesSummary } from './dashboardCopy'
import { storyGrades } from '../../lib/dashboardStats'

/**
 * "Past readings" preview — how many stories, at which grades, and the last
 * story read. "See all my readings" opens the full list on /history.
 *
 * TODO(passage title): the `passages` table has no title yet, so the last
 * story says "Story N" unless the session carries `passage_title`.
 * TODO(passage grade): sessions don't save the story grade yet, so the grades
 * are left out unless sessions carry `passage_grade`.
 */
export function PastReadings({ sessions, historyPath = '/history' }) {
  const last = sessions.at(-1)

  return (
    <DashboardCard className="gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[21px] font-black leading-tight">Past readings</h2>
        <p className="text-[17px] text-ink-soft">{storiesSummary(sessions.length, storyGrades(sessions))}</p>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl border-2 border-card-border bg-[#fff9f6] px-4 py-3">
        <span className="text-[15px] font-bold text-ink-muted">Last story · {shortDate(last.session_timestamp)}</span>
        <span className="text-lg font-black leading-tight">{last.passage_title ?? `Story ${sessions.length}`}</span>
      </div>
      <Link
        to={historyPath}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand bg-[#fff9f6] px-4 text-xl font-black text-brand shadow-card active:translate-y-1 active:shadow-none"
      >
        See all my readings
        <span aria-hidden="true">›</span>
      </Link>
    </DashboardCard>
  )
}
