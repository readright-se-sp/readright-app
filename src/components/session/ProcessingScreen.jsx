import { useEffect, useState } from 'react'
import { SkyCardPage } from '../ui/SkyCardPage'

/**
 * ProcessingScreen — "Lumi is listening…" shown on /session while the reading
 * is analyzed (after the comprehension quiz, if the analysis is still running),
 * plus a short "Great job reading!" moment on success before /results opens.
 *
 * Pure UI: SessionScreen owns the cosmetic step timer and passes `step`:
 *   0 sending · 1 listening · 2 checking · 3 almost done · 4 finished
 * The steps are reassurance, not real progress — the analysis reports none.
 * After SLOW_AFTER_MS without finishing, the copy switches to a "still
 * working, up to 2 minutes" message so a long wait doesn't feel stuck.
 */
const SLOW_AFTER_MS = 20_000

// Step colours match the "Before we start!" step cards (yellow / blue / pink)
// and finish on the app's "passed" green.
const STEPS = [
  { label: 'Sending your story', note: 'Off it goes!', badge: 'bg-cta text-level-ink', card: 'bg-shelf-card shadow-ledge-yellow' },
  { label: 'Listening to your words', note: 'Lumi hears every word', badge: 'bg-tile-blue text-white', card: 'bg-result-blue shadow-ledge-blue' },
  { label: 'Checking your reading', note: 'Counting all your stars', badge: 'bg-coral text-white', card: 'bg-result-pink shadow-ledge-pink' },
  { label: 'All done!', note: 'Your results are ready', badge: 'bg-goal text-white', card: 'bg-result-green shadow-ledge-green' },
]

const TITLES = ['Sending your story…', 'Lumi is listening…', 'Checking your reading…', 'Almost done!', 'Great job reading!']
const SUBTITLES = [
  'Hang tight — this only takes a minute.',
  'Hang tight — this only takes a minute.',
  'You read so well! Just a little longer.',
  'Getting your stars ready…',
  'Let’s see how you did!',
]
const PROGRESS = ['w-[12%]', 'w-[38%]', 'w-[66%]', 'w-[90%]', 'w-full']

export function ProcessingScreen({ step }) {
  const finished = step >= 4
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    return () => clearTimeout(t)
  }, [])

  const showSlow = slow && step < 3
  const title = showSlow ? 'Still working on it!' : TITLES[step]
  const subtitle = showSlow
    ? 'Lumi is reading extra carefully. This can take up to 2 minutes.'
    : SUBTITLES[step]

  return (
    <SkyCardPage lumi={false} circle>
      {/* Lumi + headline */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex items-center justify-center" aria-hidden="true">
          <span className="absolute size-20 rounded-full border-[3px] border-level-pill/40 motion-safe:animate-halo-ping" />
          <img src="/mascot-head-icon.svg" alt="" className="relative h-[72px] w-auto motion-safe:animate-lumi-bob [@media(max-height:680px)]:h-[52px]" />
        </div>
        <div aria-live="polite" className="text-center">
          <h1 className="mt-1.5 text-[28px] font-black leading-[1.15] text-level-ink text-balance">{title}</h1>
          <p className="text-[17px] font-bold leading-snug text-coral-ink text-pretty">{subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label="Checking your reading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={[12, 38, 66, 90, 100][step]}
        className="relative mt-3.5 h-4 overflow-hidden rounded-full bg-level-card tall:mt-5"
      >
        <div className={`h-full rounded-full bg-level-pill transition-[width] duration-700 ease-out ${PROGRESS[step]}`} />
      </div>

      {/* Steps: colour + number/✓ + words, never colour alone */}
      <ol className="relative mt-3.5 flex flex-col gap-3 tall:mt-5">
        {STEPS.map((s, i) => {
          const done = i < step || finished
          const active = i === step && !finished
          const lit = done || active
          return (
            <li
              key={s.label}
              className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-level-ink transition-all duration-300 tall:gap-3.5 tall:px-4 tall:py-3 ${
                lit ? s.card : 'bg-sticker'
              }`}
            >
              <span
                className={`flex size-9 flex-none items-center justify-center rounded-full text-[18px] font-black ${
                  lit ? s.badge : 'bg-white text-level-muted'
                }`}
                aria-hidden="true"
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`min-w-0 flex-1 ${lit ? '' : 'text-level-muted'}`}>
                <span className="block text-[17px] font-black leading-tight">{s.label}</span>
                <span className="block text-base font-bold leading-tight">{s.note}</span>
              </span>
              {active && <WorkingDots />}
              {done && i < STEPS.length - 1 && (
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-goal text-sm font-black text-white" aria-hidden="true">
                  ✓
                </span>
              )}
              <span className="sr-only">{done ? '(done)' : active ? '(in progress)' : ''}</span>
            </li>
          )
        })}
      </ol>

      <p className="relative mx-auto mt-3.5 flex items-center gap-2.5 rounded-full border-2 border-dashed border-goal bg-sticker px-4 py-1.5 text-[15px] font-bold text-goal">
        <span className="size-[9px] flex-none rounded-full bg-mint motion-safe:animate-pulse" aria-hidden="true" />
        {finished ? 'All finished — you can go on!' : 'Please keep this screen open'}
      </p>
      <p className="relative pt-2 text-center text-[12px] font-semibold text-level-muted">
        Powered by Phil-IRI Assessment Engine
      </p>
    </SkyCardPage>
  )
}

function WorkingDots() {
  return (
    <span className="flex flex-none gap-1" aria-hidden="true">
      <span className="size-[7px] rounded-full bg-level-ink motion-safe:animate-dot-bounce" />
      <span className="size-[7px] rounded-full bg-level-ink motion-safe:animate-dot-bounce [animation-delay:150ms]" />
      <span className="size-[7px] rounded-full bg-level-ink motion-safe:animate-dot-bounce [animation-delay:300ms]" />
    </span>
  )
}
