import { GOAL_WPM } from '../results/resultsCopy'
import { DashboardCard } from './DashboardParts'

/**
 * "How fast Lumi flies" — average words per minute for each of the last four
 * weeks as simple bars, with the goal line. `weeks` = [{ label, wpm }] where
 * wpm is null for a week with no reading.
 */
export function SpeedWeeksCard({ weeks }) {
  const read = weeks.filter((w) => w.wpm != null)
  const latest = read.at(-1)
  const before = read.at(-2)
  const top = Math.max(100, GOAL_WPM * 1.15, ...read.map((w) => w.wpm * 1.15))
  const pct = (wpm) => `${Math.round((wpm / top) * 100)}%`

  let headline = 'Keep reading to fly faster!'
  if (latest && latest.wpm >= GOAL_WPM) headline = 'You reached the goal!'
  else if (latest && before && latest.wpm > before.wpm) headline = 'You’re getting faster!'

  const thisWeek = weeks.at(-1)?.wpm
  const detail =
    thisWeek != null
      ? `This week you read ${thisWeek} words per minute.`
      : latest
        ? `Last time you read ${latest.wpm} words per minute.`
        : null

  return (
    <DashboardCard className="gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[21px] font-black leading-tight">How fast Lumi flies</h2>
        <p className="text-[17px] font-extrabold text-mint-ink">{headline}</p>
        {detail && <p className="text-base text-ink-soft">{detail}</p>}
      </div>

      <div className="rounded-2xl bg-[#fff9f6] px-2.5 pb-2.5 pt-3.5">
        <div className="relative h-40">
          {/* Dynamic chart geometry is the one place inline styles are needed. */}
          <div className="absolute inset-x-0 border-t-[3px] border-dashed border-goal" style={{ bottom: pct(GOAL_WPM) }}>
            <span className="absolute bottom-1.5 right-0 rounded-full bg-mint-soft px-2.5 py-0.5 text-[15px] font-black text-goal">
              Goal: {GOAL_WPM} words per minute
            </span>
          </div>
          <ul className="absolute inset-0 grid grid-cols-4 items-end gap-3">
            {weeks.map((w) => (
              <li key={w.label} className="flex h-full items-end justify-center">
                {w.wpm != null ? (
                  <div
                    className="flex w-full max-w-14 justify-center rounded-t-xl border-2 border-b-0 border-sky bg-[#c9d6f5] pt-1.5 text-[19px] font-black text-[#24366e]"
                    style={{ height: pct(w.wpm) }}
                  >
                    {w.wpm}
                    <span className="sr-only"> words per minute, {w.label}</span>
                  </div>
                ) : (
                  <div className="flex h-[58px] w-full max-w-16 items-center justify-center rounded-xl border-2 border-dashed border-[#b9a29e] text-center text-sm font-extrabold leading-tight text-ink-muted">
                    No reading
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-4 gap-3 border-t-2 border-card-border pt-2" aria-hidden="true">
          {weeks.map((w, i) => (
            <span key={w.label} className={`text-center text-sm leading-tight text-ink-soft ${i === weeks.length - 1 ? 'font-black' : 'font-bold'}`}>
              {w.label}
            </span>
          ))}
        </div>
      </div>
    </DashboardCard>
  )
}
