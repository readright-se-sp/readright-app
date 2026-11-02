import { Star } from '../dashboard/DashboardParts'
import { READING_LEVELS } from './resultsCopy'

// Gingham like the dashboard's streak card: see-through white stripes across
// and down on the level colour.
const GINGHAM =
  'bg-[linear-gradient(90deg,rgb(255_255_255/0.14)_50%,transparent_50%),linear-gradient(rgb(255_255_255/0.14)_50%,transparent_50%)] bg-size-[24px_24px]'

// Extra sparkles on an Independent score, in the card's open space. They take
// turns (each waits 0.25s more than the one before) and every other one spins.
const SPARKLES = [
  'right-[34%] top-2.5 size-3.5 text-white motion-safe:animate-glitter-spin [animation-delay:0.5s]',
  'right-2 bottom-2 size-5 text-cta motion-safe:animate-glitter [animation-delay:0.75s]',
  'right-[30%] bottom-1 size-3 text-white motion-safe:animate-glitter-spin [animation-delay:1.25s]',
  'right-[18%] top-3 size-4 text-cta motion-safe:animate-glitter [animation-delay:1.5s]',
]

/** A four-point sparkle (decoration only). */
function Sparkle({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`pointer-events-none absolute ${className}`}>
      <path d="M12 0C13 7 17 11 24 12 17 13 13 17 12 24 11 17 7 13 0 12 7 11 11 7 12 0Z" fill="currentColor" />
    </svg>
  )
}

/**
 * "Reading Aloud Score" — the results page's headline card, in the dashboard's
 * bold sticker style: a gingham card in the level's colour (green / blue /
 * amber), the "Reading aloud score" pill in its top-left corner, then a cream
 * panel with the Phil-IRI level as a big pill and its message beside the
 * word-recognition score in a yellow-ringed circle. The level is always named
 * too (never colour alone).
 *
 * An Independent score's ring is a turning gold gradient, and its stars and
 * sparkles glitter (they only move when motion is allowed).
 */
export function ReadingScoreCard({ score, readingLevel }) {
  const levelName = READING_LEVELS[readingLevel] ? readingLevel : 'Instructional'
  const level = READING_LEVELS[levelName]
  const celebrate = levelName === 'Independent'
  const glitter = celebrate ? 'motion-safe:animate-glitter' : ''

  return (
    <section className={`@container relative flex flex-col items-start gap-2.5 overflow-clip rounded-3xl p-4 ${level.tile} ${level.tileLedge} ${GINGHAM}`}>
      <Star className={`right-2 top-1.5 z-10 size-9 text-cta drop-shadow-[0_2px_0_rgba(0,0,0,0.15)] ${glitter} motion-safe:[animation-delay:0.25s]`} />
      <span aria-hidden="true" className="pointer-events-none absolute right-[26%] top-5 size-2.5 rounded-full bg-cta" />
      <Star className={`bottom-2 right-[36%] size-5 text-white ${glitter} motion-safe:[animation-delay:1s]`} />
      {celebrate && SPARKLES.map((c) => <Sparkle key={c} className={c} />)}

      {/* Heading pill on its own line in the card's top-left corner. */}
      <h2 className="relative whitespace-nowrap rounded-full bg-level-pill px-2.5 py-1 text-[13px] font-black uppercase tracking-[0.04em] text-white">
        Reading aloud score
      </h2>

      {/* Cream panel (level pill + message) beside the score circle, which
          sits fully inside the card. Both are a touch smaller on narrow phones. */}
      <div className="flex w-full items-center gap-3">
        <div className={`relative min-w-0 flex-1 rounded-2xl border-[3px] bg-sticker px-2.5 py-3.5 @[24rem]:px-3 ${level.deep} ${level.stickerLedge} ${level.ink}`}>
          <span className={`mx-auto block w-fit rounded-full border-[3px] px-2.5 py-0.5 text-[15px] font-black uppercase text-white @[24rem]:px-3 @[24rem]:text-lg ${level.badge} ${level.deep}`}>
            {levelName}
          </span>
          <p className="mt-2.5 text-base font-bold leading-snug text-pretty">{level.message}</p>
        </div>

        {/* Score circle: yellow ring (a turning gold gradient when Independent). */}
        <div className="relative size-[112px] shrink-0 @[24rem]:size-[140px]">
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full ${
              celebrate ? 'bg-conic from-track-yellow-edge via-gold-light to-track-yellow-edge motion-safe:animate-ring-spin' : 'bg-cta'
            }`}
          />
          <div className={`absolute inset-[7px] flex flex-col items-center justify-center rounded-full border-[3px] bg-sticker ${level.deep} ${level.ink}`}>
            <span className="text-[42px] font-black leading-none @[24rem]:text-[54px]">{Math.round(score)}</span>
            <span className="text-xs font-extrabold @[24rem]:text-sm">out of 100</span>
          </div>
        </div>
      </div>
    </section>
  )
}
