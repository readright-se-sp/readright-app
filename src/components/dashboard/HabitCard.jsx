import { HABIT_TIPS } from './dashboardCopy'
import { GridPattern, Star } from './DashboardParts'

/**
 * A little face sticker: two googly eyes and pink cheeks (decoration only).
 * No outline on the eyes, to match Lumi's soft look; a soft shadow under each
 * one keeps the white visible on the cream sticker.
 */
function FaceSticker() {
  return (
    <span aria-hidden="true" className="relative mt-auto ml-1 w-[48%] min-w-[84px] shrink-0 -rotate-6 rounded-[18px] border-[3px] border-tile-pink-deep bg-sticker px-2 py-1.5 shadow-sticker-pink">
      <svg viewBox="0 0 60 34" className="w-full">
        <circle cx="20" cy="16.5" r="8" fill="#f2d6cc" />
        <circle cx="40" cy="16.5" r="8" fill="#f2d6cc" />
        <circle cx="20" cy="15" r="8" fill="#fff" />
        <circle cx="40" cy="15" r="8" fill="#fff" />
        <circle cx="21.5" cy="16" r="3.8" fill="#2a1a12" />
        <circle cx="41.5" cy="16" r="3.8" fill="#2a1a12" />
        <ellipse cx="9" cy="26" rx="4.2" ry="2.5" fill="#ff8fa3" />
        <ellipse cx="51" cy="26" rx="4.2" ry="2.5" fill="#ff8fa3" />
      </svg>
    </span>
  )
}

/**
 * One short tip from Lumi, based on the habit seen most in recent readings
 * (`habitKey`, a behaviour-flag key), or praise when none was seen. Sticker
 * style: a tilted cream sticker on a pink grid tile, with a face sticker below.
 * A tile beside StoriesReadCard, as tall as its content (no fixed square).
 */
export function HabitCard({ habitKey }) {
  const tip = HABIT_TIPS[habitKey]
  return (
    <section className="relative flex w-full min-w-0 flex-col self-stretch gap-2.5 overflow-clip rounded-3xl bg-tile-pink p-3 shadow-tile-pink">
      <GridPattern />
      <Star className="bottom-[30%] right-3 size-4 text-cta" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-6 size-2 rounded-full bg-white" />

      <div className="relative rotate-2 rounded-2xl border-[3px] border-tile-pink-deep bg-sticker px-3 pb-2.5 pt-2 shadow-sticker-pink">
        <span className="inline-block rounded-full bg-tile-blue px-2.5 py-0.5 text-[13px] font-black text-white">
          {tip ? 'Try this next' : 'Lumi says'}
        </span>
        <p className="mt-1.5 text-[17px] font-black leading-tight text-pretty text-tile-pink-ink">{tip ?? 'Great reading! Keep it up.'}</p>
      </div>

      <FaceSticker />
    </section>
  )
}
