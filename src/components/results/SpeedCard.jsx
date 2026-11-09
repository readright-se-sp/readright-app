import { useEffect, useState } from 'react'
import { FlyAgainButton, GridPattern, Star } from '../dashboard/DashboardParts'
import { GOAL_WPM, MAX_WPM } from './resultsCopy'

const LUMI_PX = 50

/**
 * "How fast did Lumi fly?" — words per minute as Lumi flying along a running
 * track (the dashboard's terracotta track) to a checkered goal line. The
 * flight replays on "Fly again". Movement is skipped for users who prefer
 * reduced motion (motion-safe), so Lumi just appears in place.
 */
export function SpeedCard({ wpm }) {
  const words = Math.round(wpm)
  const pct = Math.min(1, words / MAX_WPM) * 100
  const goalPct = (GOAL_WPM / MAX_WPM) * 100
  const [flown, setFlown] = useState(false)
  const [flight, setFlight] = useState(0)

  // Start each flight from the start line, then glide to the speed position.
  useEffect(() => {
    const t = setTimeout(() => setFlown(true), 400)
    return () => clearTimeout(t)
  }, [flight])

  function flyAgain() {
    setFlown(false)
    setFlight((n) => n + 1)
  }

  // Keep Lumi inside the flight area: shift left by the share of her width.
  const at = (extra = 0) => (flown ? `calc(${pct}% - ${(pct / 100) * LUMI_PX}px + ${extra}px)` : `${extra}px`)
  const motion = flown ? 'motion-safe:transition-all motion-safe:duration-[2400ms] motion-safe:ease-out' : ''

  const message =
    words < GOAL_WPM
      ? `Lumi is flying nicely! Read ${GOAL_WPM - words} more words a minute to reach your goal.`
      : 'Wow, Lumi reached the goal! Great speed!'

  return (
    <section className="relative isolate flex flex-col gap-1 overflow-clip rounded-3xl bg-shelf-card p-4.5 text-result-olive shadow-ledge-yellow">
      {/* Faint yellow graph-paper grid, behind everything (white wouldn't show on this pale yellow). */}
      <GridPattern cell={24} color="#e8b83a" opacity={0.3} className="-z-10" />
      {/* Wraps "Fly again" under the pill on the narrowest phones. */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <h2 className="whitespace-nowrap rounded-full bg-level-pill px-2 py-1 text-[13px] font-black uppercase tracking-normal text-white">How fast did Lumi fly?</h2>
        <FlyAgainButton onClick={flyAgain} />
      </div>
      <p className="flex items-baseline gap-2">
        <span className="text-[44px] font-black leading-none">{words}</span>
        <span className="text-lg font-extrabold">words in 1 minute</span>
      </p>

      {/* The track: terracotta block with a white start line. Lumi, her trail
          and the goal share one flight area (left-5 → right-2), and the goal
          label floats above the track (pt-10 makes room for it). */}
      <div aria-hidden="true" className="mt-1 pt-10">
        <div className="relative h-18 rounded-2xl border-[3px] border-level-tile-edge bg-track shadow-level-tile">
          <span className="absolute inset-y-1 left-3 w-[3px] rounded-full bg-white" />
          <div className="absolute inset-y-0 left-5 right-2">
            {/* Dynamic track geometry is the one place inline styles are needed. */}
            <div className="absolute bottom-0 top-0 w-3 -translate-x-1/2 border-x-2 border-[#2a1a12] bg-[conic-gradient(#2a1a12_25%,#fff_0_50%,#2a1a12_0_75%,#fff_0)] bg-size-[8px_8px]" style={{ left: `${goalPct}%` }} />
            <span className="absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-level-tile-edge bg-goal px-2.5 py-0.5 text-sm font-black text-white" style={{ left: `${goalPct}%` }}>
              Goal {GOAL_WPM}
            </span>
            <div className={`absolute -left-2 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-white/60 ${motion}`} style={{ width: at(LUMI_PX / 2 + 8) }} />
            <img
              src="/mascot-reading.svg"
              alt=""
              className={`absolute top-1/2 -translate-y-1/2 ${motion}`}
              style={{ left: at(), width: LUMI_PX }}
            />
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="mt-2.5 flex justify-between text-sm font-extrabold">
        <span>Slow</span>
        <span>Just right</span>
        <span>Super fast</span>
      </div>
      <p className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-dash-line bg-sticker px-3.5 py-3 text-base font-bold text-pretty">
        <span className="relative size-6 shrink-0"><Star className="inset-0 size-6 text-coral" /></span>
        {message}
      </p>
    </section>
  )
}
