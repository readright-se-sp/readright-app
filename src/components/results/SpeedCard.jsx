import { useEffect, useState } from 'react'
import { GOAL_WPM, MAX_WPM } from './resultsCopy'

const LUMI_PX = 58

/**
 * "How fast did Lumi fly?" — words per minute as Lumi flying along a track to a
 * goal flag. The flight replays on "Fly again". Movement is skipped for users
 * who prefer reduced motion (motion-safe), so Lumi just appears in place.
 */
export function SpeedCard({ wpm }) {
  const words = Math.round(wpm)
  const pct = Math.min(1, words / MAX_WPM) * 100
  const goalPct = (GOAL_WPM / MAX_WPM) * 100
  const [flown, setFlown] = useState(false)
  const [flight, setFlight] = useState(0)

  // Start each flight from the left edge, then glide to the speed position.
  useEffect(() => {
    const t = setTimeout(() => setFlown(true), 400)
    return () => clearTimeout(t)
  }, [flight])

  function flyAgain() {
    setFlown(false)
    setFlight((n) => n + 1)
  }

  // Keep Lumi inside the track: shift left by the share of her width.
  const lumiLeft = flown ? `calc(${pct}% - ${(pct / 100) * LUMI_PX}px)` : '0px'
  const trailWidth = flown ? `calc(${pct}% - ${(pct / 100) * LUMI_PX}px + 20px)` : '0px'
  const motion = flown ? 'motion-safe:transition-all motion-safe:duration-[2400ms] motion-safe:ease-out' : ''

  const message =
    words < GOAL_WPM
      ? `Lumi is flying nicely! Read ${GOAL_WPM - words} more words a minute to reach your goal.`
      : 'Wow, Lumi reached the goal! Great speed!'

  return (
    <section className="rounded-[24px] bg-sky-soft p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-black uppercase tracking-[0.06em] text-[#3e5ba8]">How fast did Lumi fly?</h2>
        <button
          type="button"
          onClick={flyAgain}
          className="min-h-[44px] rounded-full bg-white px-3.5 text-sm font-extrabold text-[#3e5ba8]"
        >
          Fly again
        </button>
      </div>
      <p className="mb-2.5 mt-1 flex items-baseline gap-1.5">
        <span className="text-[36px] font-black leading-none text-[#1f2a4a]">{words}</span>
        <span className="text-[15px] font-bold text-[#3e4a6b]">words in 1 minute</span>
      </p>

      <div className="relative h-[70px]" aria-hidden="true">
        <div className="absolute inset-x-0 top-[34px] h-3.5 rounded-full bg-white" />
        <div className={`absolute left-0 top-[34px] h-3.5 rounded-full bg-sky ${motion}`} style={{ width: trailWidth }} />
        <div className="absolute top-[22px] h-[38px] w-[3px] rounded-sm bg-mint-ink" style={{ left: `${goalPct}%` }} />
        <div
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-mint-ink px-2 py-0.5 text-xs font-black text-white"
          style={{ left: `${goalPct}%` }}
        >
          Goal {GOAL_WPM}
        </div>
        <div className={`absolute top-2.5 ${motion}`} style={{ left: lumiLeft, width: LUMI_PX, height: LUMI_PX }}>
          <span className="flex size-full items-center justify-center rounded-full bg-white shadow-[0_3px_8px_rgba(40,60,120,0.25)]">
            <img src="/mascot-reading.svg" alt="" className="w-[46px] motion-safe:animate-lumi-bob" />
          </span>
        </div>
      </div>

      <div className="mt-1 flex justify-between text-sm font-extrabold text-[#5a6890]" aria-hidden="true">
        <span>Slow</span>
        <span>Just right</span>
        <span>Super fast</span>
      </div>
      <p className="mt-2.5 text-[15px] font-bold text-[#2b3555] text-pretty">{message}</p>
    </section>
  )
}
