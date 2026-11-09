import { useEffect, useState } from 'react'
import { GOAL_WPM } from '../results/resultsCopy'
import { FlyAgainButton, PeachCard } from './DashboardParts'

// Track geometry (px). The week names sit in an 88px column left of the track;
// inside the track, Lumi's flight area starts at --lane-x (after the lane
// number + start line) and ends 36px before the right edge, leaving a spot
// for the goal trophy. Lane numbers only show once the card is wide enough;
// narrow phones give that room to Lumi.
const PAST_H = 48
const CURRENT_H = 72
const LANE_X = '[--lane-x:18px] @[22rem]:[--lane-x:42px]'
const FLIGHT_AREA = 'absolute inset-y-0 left-(--lane-x) right-9'
// Where the goal line sits along the flight area (%).
const GOAL_AT = 60

/** A gold trophy, soft style with no outline (decoration only). */
function Trophy({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M7 5H4.5a2.5 2.5 0 0 0 2.6 4.6M17 5h2.5a2.5 2.5 0 0 1-2.6 4.6" fill="none" stroke="#f0a92a" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 3h10v5.5a5 5 0 0 1-10 0z" fill="#ffc43d" />
      <rect x="11" y="13" width="2" height="4.5" fill="#e89a1f" />
      <rect x="7.5" y="17" width="9" height="4" rx="1.3" fill="#d98b1a" />
      <path d="M9.6 5.2v3" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * One lane of the track: Lumi flies from the start line to the week's speed,
 * with the number beside her. `current` (this week) is the taller lane.
 * `pct` is the week's spot along the flight area (0–100), or null for a week
 * with no reading. A week at or past the goal gets a trophy at the lane's
 * right end, which pops in once Lumi has landed.
 */
function Lane({ number, label, wpm, pct, current, flown }) {
  const beePx = current ? 48 : 34
  // Lumi's front edge marks the week's speed, so she only crosses the goal
  // line at or past the goal. She stops early if needed so her number bubble
  // (width estimated from its digits) still fits before the lane's trophy spot.
  const digits = String(wpm ?? '').length
  const reserve = beePx + 2 + (current ? 22 + 11 * digits : 18 + 9 * digits)
  const at = (extra = 0) =>
    flown ? `calc(min(max(0px, ${pct}% - ${beePx}px), 100% - ${reserve}px) + ${extra}px)` : `${extra}px`
  // Every lane starts together and takes the same time, so the Lumi going
  // farthest (the higher number) visibly flies fastest. Linear keeps that
  // speed difference steady the whole way.
  const motion = flown ? 'motion-safe:transition-all motion-safe:duration-[2000ms] motion-safe:ease-linear' : ''
  const reachedGoal = wpm != null && wpm >= GOAL_WPM

  return (
    <li className="grid grid-cols-[88px_1fr] items-center gap-x-2.5" style={{ height: current ? CURRENT_H : PAST_H }}>
      <span className="sr-only">
        {label}: {wpm != null ? `${wpm} words per minute${reachedGoal ? ', reached the goal' : ''}` : 'no reading'}
      </span>
      <span
        aria-hidden="true"
        className={current
          ? 'justify-self-start -rotate-3 whitespace-nowrap rounded-full bg-track-yellow px-3 py-1.5 text-sm font-black text-level-ink'
          : 'text-sm font-bold leading-tight text-level-muted'}
      >
        {label}
      </span>

      <div aria-hidden="true" className="relative h-full">
        <span className="absolute inset-y-0 left-1.5 hidden w-6 items-center justify-center text-lg font-black text-level-ink @[22rem]:flex">{number}</span>
        <div className={FLIGHT_AREA}>
          {pct == null ? (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-dashed border-level-tile-edge bg-[#fff6e6] px-2.5 py-0.5 text-sm font-black text-level-ink">
              No reading
            </span>
          ) : (
            <>
              {/* Dynamic track geometry is the one place inline styles are needed. */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full ${current ? 'h-2.5 bg-white/75' : 'h-2 bg-white/40'} ${motion}`} style={{ width: at(beePx / 2) }} />
              <div className={`absolute top-1/2 flex -translate-y-1/2 items-center ${motion}`} style={{ left: at() }}>
                <img src="/mascot-reading.svg" alt="" style={{ width: beePx }} className="shrink-0 motion-safe:animate-lumi-bob" />
                <span className={`ml-0.5 rounded-full border-2 border-level-tile-edge font-black ${current ? 'bg-track-yellow px-2 py-0.5 text-base text-level-ink' : 'bg-white px-1.5 text-sm text-level-ink'}`}>
                  {wpm}
                </span>
              </div>
            </>
          )}
        </div>
        {reachedGoal && (
          <span
            className={`absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-sticker ${
              flown ? 'scale-100 opacity-100 motion-safe:delay-[2000ms]' : 'scale-50 opacity-0'
            } motion-safe:transition motion-safe:duration-300`}
          >
            <Trophy className="size-5" />
          </span>
        )}
      </div>
    </li>
  )
}

/**
 * "How fast Lumi flies" — a running track with one lane per week (oldest
 * first, this week last in a yellow lane): Lumi flies to each week's words per
 * minute, past a checkered goal line. "Fly again" replays the race; movement
 * is skipped for users who prefer reduced motion. `weeks` = [{ label, wpm }],
 * wpm null for a week with no reading.
 */
export function SpeedWeeksCard({ weeks }) {
  const [flown, setFlown] = useState(false)
  const [flight, setFlight] = useState(0)

  // Each race starts from the start line, then Lumi glides to her spot.
  useEffect(() => {
    const t = setTimeout(() => setFlown(true), 400)
    return () => clearTimeout(t)
  }, [flight])

  function flyAgain() {
    setFlown(false)
    setFlight((n) => n + 1)
  }

  // The goal line always sits at GOAL_AT % of the flight area and each week is
  // placed relative to it (Lane keeps each Lumi and her number on the track).
  const pct = (wpm) => Math.min(100, (wpm / GOAL_WPM) * GOAL_AT)
  const goalPct = GOAL_AT
  const pastCount = weeks.length - 1
  const thisWeek = weeks.at(-1)?.wpm

  const message =
    thisWeek == null
      ? 'Read a story this week to make Lumi fly!'
      : thisWeek < GOAL_WPM
        ? `Lumi is flying nicely! Read ${GOAL_WPM - thisWeek} more words a minute to reach your goal.`
        : 'Wow, Lumi reached the goal! Great speed!'

  return (
    <PeachCard tone="mint" pill="Lumi race" title="How fast Lumi flies" action={<FlyAgainButton green onClick={flyAgain} />}>
      <div className={LANE_X}>
        <div className="relative pt-9">
          {/* The track itself, under everything: terracotta block (bottom ledge,
              no outline), dashed lane lines and the white start line. This
              week's lane has no highlight, so Lumi's yellow body stands out;
              the yellow "This week" label marks it instead. */}
          <div aria-hidden="true" className="absolute bottom-0 left-[98px] right-0 top-9 rounded-2xl bg-track shadow-level-tile">
            {Array.from({ length: pastCount }, (_, i) => (
              <span key={i} className="absolute inset-x-0 border-t-2 border-dashed border-white/70" style={{ top: (i + 1) * PAST_H - 1 }} />
            ))}
            <span className="absolute bottom-1.5 top-1.5 left-[calc(var(--lane-x)-6px)] w-[3px] rounded-full bg-white" />
          </div>

          {/* Goal: a checkered finish line inside the track only (top-9 = the
              track's top edge), with its label floating clear above it. */}
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[calc(98px+var(--lane-x))] right-9 top-0">
            <div className="absolute bottom-0 top-9 w-3 -translate-x-1/2 border-x-2 border-[#2a1a12] bg-[conic-gradient(#2a1a12_25%,#fff_0_50%,#2a1a12_0_75%,#fff_0)] bg-size-[8px_8px]" style={{ left: `${goalPct}%` }} />
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-goal px-3 py-1 text-sm font-black text-white" style={{ left: `${goalPct}%` }}>
              Goal {GOAL_WPM}
            </span>
          </div>

          <ul className="relative">
            {weeks.map((w, i) => (
              <Lane
                key={w.label}
                number={i + 1}
                label={w.label}
                wpm={w.wpm}
                pct={w.wpm != null ? pct(w.wpm) : null}
                current={i === weeks.length - 1}
                flown={flown}
              />
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="mt-2.5 flex justify-between pl-[98px] text-sm font-bold text-level-muted">
          <span>Start</span>
          <span>Super fast</span>
        </div>
      </div>

      <p className="relative rounded-2xl border-[3px] border-dash-mint-edge bg-white px-3.5 py-3 text-base font-bold text-level-ink text-pretty">
        {message}
      </p>
    </PeachCard>
  )
}
