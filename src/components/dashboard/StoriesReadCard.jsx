import { GridPattern, Star } from './DashboardParts'

/**
 * An open book: pink cover, white pages with lines, yellow bookmark. No
 * outline, to match Lumi's soft look — each shape is stroked in its own
 * colour only to round its corners, and shading keeps the parts apart.
 */
function OpenBook() {
  const soft = (color) => ({ fill: color, stroke: color, strokeWidth: 2.2, strokeLinejoin: 'round' })
  return (
    <svg aria-hidden="true" viewBox="0 0 48 40" className="w-[64%]">
      <path d="M3 12 24 14 45 12V35L24 37 3 35Z" {...soft('#e0507c')} />
      <path d="M21 13.7 24 14 27 13.7V36.7L24 37 21 36.7Z" fill="#c23d66" />
      <path d="M6 8 23 10V33L6 31Z" {...soft('#fff')} />
      <path d="M25 10 42 8V31L25 33Z" {...soft('#fff')} />
      {/* Pale shading where the pages dip into the spine. */}
      <path d="M19.5 9.6 23 10V33L19.5 32.6Z" fill="#dfe8fd" />
      <path d="M25 10 28.5 9.6V32.6L25 33Z" fill="#dfe8fd" />
      <path d="M9.5 14.5 17 15.4M9.5 19 17 19.9M9.5 23.5 15 24.2M31 15 31.5 14.9M31.5 19.5 39 18.6M31.5 24 39 23.1" stroke="#8fb0f0" strokeWidth="2" strokeLinecap="round" />
      <path d="M33.5 5.5H38V17L35.75 15 33.5 17Z" {...soft('#ffc43d')} strokeWidth="1.2" />
    </svg>
  )
}

/**
 * "You've read 12 stories", sticker style: a tilted cream sticker on a blue
 * grid tile, with a book in a cream circle on its corner. Tile beside
 * HabitCard. Book and sparkles are decorative.
 */
export function StoriesReadCard({ total }) {
  return (
    // As tall as its content (no fixed square), matching HabitCard beside it.
    <section className="@container relative flex w-full min-w-0 flex-col self-stretch overflow-clip rounded-3xl bg-tile-blue p-3 shadow-tile-blue">
      <GridPattern />
      <Star className="right-2.5 top-3 size-4 text-cta" />
      <Star className="bottom-4 left-4 size-4 text-white" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-7 left-[38%] size-2 rounded-full bg-cta" />

      <div className="relative mr-2 -rotate-3 rounded-2xl border-[3px] border-tile-blue-deep bg-sticker px-2.5 pb-2 pt-1.5 shadow-sticker-blue @[11rem]:mr-5 @[11rem]:px-3">
        <span className="block whitespace-nowrap text-xs font-black uppercase text-tile-pink-deep @[11rem]:text-[13px] @[11rem]:tracking-wide">You’ve read</span>
        <span className="block text-[48px] font-black leading-none text-tile-blue-ink">{total}</span>
        <span className="block text-lg font-black leading-tight text-tile-blue-ink">{total === 1 ? 'story' : 'stories'}</span>
      </div>

      {/* Tucks under the sticker's bottom-right corner; bigger on wider tiles. */}
      <span aria-hidden="true" className="relative -mt-4 flex size-[52px] shrink-0 items-center self-end @[11rem]:size-[72px] @[13rem]:size-[84px] justify-center rounded-full border-[3px] border-tile-blue-deep bg-sticker shadow-sticker-blue">
        <OpenBook />
      </span>
    </section>
  )
}
