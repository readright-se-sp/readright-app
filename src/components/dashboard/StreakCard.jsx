import { Star } from './DashboardParts'

/** Teal gingham: see-through white stripes across and down; where they cross it looks lighter. */
function Gingham() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      <defs>
        <pattern id="streak-gingham" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="12" height="24" fill="white" fillOpacity="0.14" />
          <rect width="24" height="12" fill="white" fillOpacity="0.14" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#streak-gingham)" />
    </svg>
  )
}

/** A friendly flame with a face: orange drop, yellow middle, dark eyes, pink cheeks. */
function FireBuddy() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-14 @[20rem]:size-[68px]">
      <path d="M25 4c6 8 15 15 15 26a16 16 0 0 1-32 0C8 20 18 13 25 4z" fill="#ff7a3d" />
      <path d="M24 19c4 4.5 9 8.5 9 14a9 9 0 0 1-18 0c0-5.5 5-9.5 9-14z" fill="#ffd43d" />
      <circle cx="20.5" cy="32" r="1.7" fill="#2a1a12" />
      <circle cx="27.5" cy="32" r="1.7" fill="#2a1a12" />
      <ellipse cx="17.5" cy="35.6" rx="2" ry="1.3" fill="#ff8fa3" />
      <ellipse cx="30.5" cy="35.6" rx="2" ry="1.3" fill="#ff8fa3" />
    </svg>
  )
}

/**
 * Streak card, "sticker" style: a tilted cream sticker with the day count on a
 * teal gingham card, a few sparkles, and a smiling flame in a cream circle.
 * The stars and flame are decorative; the text carries the meaning.
 */
export function StreakCard({ streak }) {
  return (
    <section className="@container relative flex items-center gap-1.5 overflow-hidden rounded-3xl bg-tile-teal px-4 py-4 shadow-tile-teal">
      <Gingham />

      <div className="relative min-w-0 -rotate-2 rounded-2xl border-[3px] border-tile-teal-deep bg-sticker py-2.5 pl-5 pr-8 shadow-sticker">
        <span className="block text-sm font-black uppercase tracking-wide text-coral-ink">My streak</span>
        {streak > 0 ? (
          <p className="flex items-baseline gap-2 text-tile-teal-ink">
            <span className="text-[54px] font-black leading-none">{streak}</span>
            <span className="text-[19px] font-black leading-tight text-balance">{streak === 1 ? 'day in a row' : 'days in a row'}</span>
          </p>
        ) : (
          <p className="text-[19px] font-black leading-tight text-tile-teal-ink">Read today to start a streak!</p>
        )}
      </div>

      {/* Sparkles fill the gap between the sticker and the flame, full card height:
          star top-left, dot right, star bottom-middle. Too narrow a gap → hidden. */}
      <span aria-hidden="true" className="@container relative -my-4 flex-1 self-stretch">
        <span className="@max-[2.25rem]:hidden">
          <Star className="left-[12%] top-[16%] size-4 text-cta" />
          <span className="pointer-events-none absolute right-[10%] top-[36%] size-2.5 rounded-full bg-cta" />
          <Star className="bottom-[10%] left-[42%] size-5 text-white" />
        </span>
      </span>

      <span className="relative flex size-[72px] shrink-0 @[20rem]:size-[84px] items-center justify-center rounded-full border-[3px] border-tile-teal-deep bg-sticker shadow-sticker">
        <FireBuddy />
      </span>
    </section>
  )
}
