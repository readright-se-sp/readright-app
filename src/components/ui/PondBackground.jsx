import { LilyPad, LotusBud, Ripple } from './PondParts'

/**
 * PondBackground — calm, light pond water with lily pads, lotus buds and
 * ripples, pinned to the screen behind a page that scrolls over it (/history).
 * The pads sit around the edges and corners so they peek out beside the
 * content instead of crowding it; on wide screens they frame the column.
 * Pads drift gently only when the learner allows motion. Hidden from screen
 * readers.
 */

// Each pad: spot, size and turn (so no two look alike), plus how far it lags
// in the drift loop.
const PADS = [
  '-left-24 top-[12%] size-36 rotate-12',
  '-right-14 top-[27%] size-44 -rotate-45 [animation-delay:-4s]',
  '-left-10 top-[52%] size-28 rotate-90 [animation-delay:-7s]',
  '-right-8 top-[70%] size-32 rotate-[200deg] [animation-delay:-2s]',
  'left-[22%] -bottom-12 size-40 rotate-[35deg] [animation-delay:-5s]',
  'right-[14%] top-[3%] size-16 -rotate-12 [animation-delay:-8s]',
  'left-[12%] top-[38%] size-14 rotate-[150deg] [animation-delay:-3s]',
]

export function PondBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-linear-to-b from-pond-top to-pond-bottom">
      <Ripple className="left-[30%] top-[18%] w-24" />
      <Ripple className="right-[24%] top-[46%] w-20" />
      <Ripple className="left-[6%] top-[80%] w-28" />
      <Ripple className="right-[30%] top-[88%] w-16" />
      {PADS.map((p) => (
        <LilyPad key={p} className={`motion-safe:animate-cloud-drift ${p}`} />
      ))}
      <LotusBud className="right-[8%] top-[22%] w-12" />
      <LotusBud className="right-10 top-[78%] w-14" />
      <LotusBud className="right-[30%] top-[6%] w-10" />
    </div>
  )
}
