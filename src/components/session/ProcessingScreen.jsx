import { useEffect, useState } from 'react'
import { LogoMark } from '../icons'
import { Star } from '../dashboard/DashboardParts'
import { StickerPage } from '../ui/StickerPage'

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
  { label: 'Sending your story', note: 'Off it goes!', badge: 'bg-cta text-level-ink', card: 'bg-shelf-card' },
  { label: 'Listening to your words', note: 'Lumi hears every word', badge: 'bg-tile-blue text-white', card: 'bg-result-blue' },
  { label: 'Checking your reading', note: 'Counting all your stars', badge: 'bg-coral text-white', card: 'bg-result-pink' },
  { label: 'All done!', note: 'Your results are ready', badge: 'bg-goal text-white', card: 'bg-result-green' },
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
    <StickerPage>
      {/* Big soft circle behind Lumi, with a few sparkles. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[300px]">
        <span className="absolute -top-[150px] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-level-blob" />
        <Star className="left-[14%] top-[110px] size-6 text-cta" />
        <Star className="right-[14%] top-[80px] size-7 text-coral" />
        <span className="absolute left-[24%] top-[230px] size-2.5 rounded-full bg-mint" />
        <span className="absolute right-[22%] top-[210px] size-3 rounded-full bg-tile-blue" />
      </div>

      <header className="relative flex items-center justify-center gap-1.5 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="flex -translate-y-0.5"><LogoMark size={32} /></span>
        <span className="text-xl font-black text-level-ink">ReadRight</span>
      </header>

      {/* Lumi + headline */}
      <div className="relative flex flex-col items-center pt-3">
        <div className="relative flex h-[170px] w-[180px] items-center justify-center" aria-hidden="true">
          <span className="absolute size-40 rounded-full border-[3px] border-level-pill/40 motion-safe:animate-halo-ping" />
          <img src="/mascot-reading.svg" alt="" className="relative w-[140px] motion-safe:animate-lumi-bob" />
        </div>
        <div aria-live="polite" className="text-center">
          <h1 className="mb-1.5 mt-3 text-[30px] font-black leading-[1.1] text-level-ink text-balance">{title}</h1>
          <p className="text-[17px] font-bold text-coral-ink text-pretty">{subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label="Checking your reading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={[12, 38, 66, 90, 100][step]}
        className="relative mt-5 h-5 overflow-hidden rounded-full border-[3px] border-level-tile-edge bg-white"
      >
        <div className={`h-full rounded-full bg-level-pill transition-[width] duration-700 ease-out ${PROGRESS[step]}`} />
      </div>

      {/* Steps: colour + number/✓ + words, never colour alone */}
      <ol className="relative mt-5 flex flex-col gap-3">
        {STEPS.map((s, i) => {
          const done = i < step || finished
          const active = i === step && !finished
          const lit = done || active
          return (
            <li
              key={s.label}
              className={`flex items-center gap-3.5 rounded-[20px] border-[3px] px-4 py-3 text-level-ink transition-all duration-300 ${
                lit ? `border-level-tile-edge ${s.card}` : 'border-dashed border-level-edge bg-white/50'
              } ${active ? 'shadow-level-tile' : ''}`}
            >
              <span
                className={`flex size-10 flex-none items-center justify-center rounded-full border-[3px] text-[19px] font-black ${
                  lit ? `border-level-tile-edge ${s.badge}` : 'border-level-edge bg-white text-level-muted'
                }`}
                aria-hidden="true"
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`min-w-0 flex-1 ${lit ? '' : 'text-level-muted'}`}>
                <span className="block text-[17px] font-black leading-tight">{s.label}</span>
                <span className="block text-base font-bold">{s.note}</span>
              </span>
              {active && <WorkingDots />}
              {done && i < STEPS.length - 1 && (
                <span className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-level-tile-edge bg-goal text-sm font-black text-white" aria-hidden="true">
                  ✓
                </span>
              )}
              <span className="sr-only">{done ? '(done)' : active ? '(in progress)' : ''}</span>
            </li>
          )
        })}
      </ol>

      <div className="min-h-5 flex-1" />

      <p className="relative mx-auto mt-5 flex items-center gap-2.5 rounded-full border-2 border-dashed border-goal bg-sticker px-4 py-2 text-[15px] font-bold text-goal">
        <span className="size-[9px] flex-none rounded-full bg-mint motion-safe:animate-pulse" aria-hidden="true" />
        {finished ? 'All finished — you can go on!' : 'Please keep this screen open'}
      </p>
      <p className="relative pt-4 text-center text-[12px] font-semibold text-level-muted">
        Powered by Phil-IRI Assessment Engine
      </p>
    </StickerPage>
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
