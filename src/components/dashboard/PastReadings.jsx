import { useState } from 'react'
import { DashboardCard, Face } from './DashboardParts'
import { LEVEL_FACES } from './dashboardCopy'

const SHOWN = 5

/**
 * "Past readings" — newest first, with date and reading-level pill. Shows the
 * last five; "See all" expands the list.
 *
 * TODO(past results): rows aren't tappable yet — opening an old reading's
 * results needs the full result saved per session.
 * TODO(passage title): the `passages` table has no title yet, so rows say
 * "Story N" unless a session carries `passage_title`.
 */
export function PastReadings({ sessions }) {
  const [showAll, setShowAll] = useState(false)
  const rows = sessions.map((s, i) => ({ ...s, number: i + 1 })).reverse()
  const visible = showAll ? rows : rows.slice(0, SHOWN)

  return (
    <DashboardCard className="gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[21px] font-black leading-tight">Past readings</h2>
        {rows.length > SHOWN && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="flex min-h-11 min-w-11 items-center px-1 text-[17px] font-black text-brand"
          >
            {showAll ? 'Show less' : 'See all ›'}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2.5">
        {visible.map((s) => {
          const face = LEVEL_FACES[s.reading_level]
          return (
            <li key={s.id ?? s.session_timestamp} className="flex min-h-[68px] flex-col justify-center gap-1.5 rounded-2xl border-2 border-card-border bg-[#fff9f6] px-3.5 py-2.5">
              <span className="text-[17px] font-black leading-tight">{s.passage_title ?? `Story ${s.number}`}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-bold text-ink-muted">
                  {new Date(s.session_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {face && (
                  <span className={`flex items-center gap-1.5 rounded-full border-[1.5px] py-0.5 pl-1 pr-2.5 ${face.card} ${face.border} ${face.ink}`}>
                    <Face mood={face.mood} size={22} />
                    <span className="text-sm font-extrabold">{face.label}</span>
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </DashboardCard>
  )
}
