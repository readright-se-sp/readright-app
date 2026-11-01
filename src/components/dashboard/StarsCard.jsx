import { DashboardCard } from './DashboardParts'
import { BADGE_STYLES } from './dashboardCopy'

/**
 * Total stars + badges. Locked badges show a lock and a muted label, not just
 * a faded colour. TODO(stars): the star rule is a placeholder (lib/dashboardStats).
 */
export function StarsCard({ stars, badges }) {
  return (
    <DashboardCard className="gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[40px] leading-none text-amber" aria-hidden="true">★</span>
        <div className="flex flex-col">
          <span className="text-[30px] font-black leading-none">
            {stars} {stars === 1 ? 'star' : 'stars'}
          </span>
          <span className="text-base font-semibold text-ink-soft">You earned these by reading!</span>
        </div>
      </div>
      <ul className="grid grid-cols-4 gap-2">
        {badges.map((b) => (
          <li key={b.key} className="flex flex-col items-center gap-1.5 text-center">
            {b.earned ? (
              <span className={`flex size-14 items-center justify-center rounded-full border-[2.5px] text-[22px] font-black ${BADGE_STYLES[b.key]}`} aria-hidden="true">
                {b.glyph}
              </span>
            ) : (
              <span className="flex size-14 items-center justify-center rounded-full border-[2.5px] border-dashed border-[#a8958f] bg-[#ece4e2] text-ink-muted" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z" />
                </svg>
              </span>
            )}
            <span className={`text-sm font-extrabold leading-tight ${b.earned ? 'text-ink' : 'text-ink-muted'}`}>
              {b.name}
              {!b.earned && <span className="sr-only"> (locked)</span>}
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
