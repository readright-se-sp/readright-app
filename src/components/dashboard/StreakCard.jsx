import { WEEKLY_GOAL } from '../../lib/dashboardStats'

/** "3 days in a row 🔥" + "2 of 3 stories this week" with one dot per story. */
export function StreakCard({ streak, thisWeek }) {
  const done = Math.min(thisWeek, WEEKLY_GOAL)
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3 rounded-3xl border-2 border-card-border bg-card p-4 shadow-card">
      <div className="flex flex-col justify-center gap-1 rounded-2xl bg-peach p-3.5">
        <span className="text-[30px] leading-none" aria-hidden="true">🔥</span>
        <span className="text-[19px] font-black leading-tight">
          {streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'} in a row` : 'Read today to start a streak!'}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-2.5 rounded-2xl bg-[#fff9f6] p-3.5">
        <span className="text-[17px] font-extrabold leading-tight">
          {thisWeek >= WEEKLY_GOAL
            ? `${thisWeek} ${thisWeek === 1 ? 'story' : 'stories'} this week. Goal reached!`
            : `${thisWeek} of ${WEEKLY_GOAL} stories this week`}
        </span>
        <div className="flex gap-2" aria-hidden="true">
          {Array.from({ length: WEEKLY_GOAL }, (_, i) =>
            i < done ? (
              <span key={i} className="flex size-8 items-center justify-center rounded-full bg-mint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </span>
            ) : (
              <span key={i} className="size-8 rounded-full border-[2.5px] border-dashed border-[#b9a29e]" />
            ),
          )}
        </div>
      </div>
    </section>
  )
}
