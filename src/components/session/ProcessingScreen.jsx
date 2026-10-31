import { useEffect, useState } from 'react'
import { LogoMark } from '../icons'

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

// Step colors reuse the "Before we start!" step-card palette (amber / sky /
// coral) and finish on the app's "passed" green.
const STEPS = [
  { label: 'Sending your story', note: 'Off it goes!', badge: 'bg-amber', card: 'bg-peach', border: 'border-amber' },
  { label: 'Listening to your words', note: 'Lumi hears every word', badge: 'bg-sky', card: 'bg-sky-soft', border: 'border-sky' },
  { label: 'Checking your reading', note: 'Counting all your stars', badge: 'bg-coral', card: 'bg-coral-soft', border: 'border-coral' },
  { label: 'All done!', note: 'Your results are ready', badge: 'bg-mint-ink', card: 'bg-mint-soft', border: 'border-mint-ink' },
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
    <div className="flex min-h-dvh items-start justify-center bg-[#f3e6e3] px-4 py-6 font-display text-ink">
      <div className="flex w-full max-w-[400px] flex-col rounded-[28px] border-2 border-card-border bg-[#fffdfc] shadow-[0px_18px_40px_0px_rgba(120,60,50,0.12)]">
        <div className="flex items-center gap-2.5 px-5.5 py-4.5">
          <LogoMark size={36} />
          <span className="text-[22px] font-black text-brand">ReadRight</span>
        </div>

        {/* Lumi + headline */}
        <div className="flex flex-col items-center px-6.5 pt-2">
          <div className="relative flex h-[180px] w-[190px] items-center justify-center" aria-hidden="true">
            <span className="absolute size-40 rounded-full bg-coral-soft" />
            <span className="absolute size-40 rounded-full border-[3px] border-[#f2b8b2] motion-safe:animate-halo-ping" />
            <img src="/mascot-reading.svg" alt="" className="relative w-[150px] motion-safe:animate-lumi-bob" />
          </div>
          <div aria-live="polite" className="text-center">
            <h1 className="mb-1.5 mt-2.5 text-[30px] font-black leading-[1.1] text-balance">{title}</h1>
            <p className="text-[17px] font-semibold text-ink-soft text-pretty">{subtitle}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6.5 pt-5.5">
          <div
            role="progressbar"
            aria-label="Checking your reading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={[12, 38, 66, 90, 100][step]}
            className="h-3.5 overflow-hidden rounded-full bg-[#f3e6e3]"
          >
            <div className={`h-full rounded-full bg-coral transition-[width] duration-700 ease-out ${PROGRESS[step]}`} />
          </div>
        </div>

        {/* Steps: color + number/✓ + words, never color alone */}
        <ol className="flex flex-col gap-2.5 px-6.5 pt-4.5">
          {STEPS.map((s, i) => {
            const done = i < step || finished
            const active = i === step && !finished
            const lit = done || active
            return (
              <li
                key={s.label}
                className={`flex items-center gap-3.5 rounded-[18px] border-2 px-4 py-3 transition-all duration-300 ${
                  lit ? s.card : 'bg-[#f8f2f1] opacity-75'
                } ${active ? s.border : 'border-transparent'}`}
              >
                <span
                  className={`flex size-[42px] flex-none items-center justify-center rounded-full text-[19px] font-black text-white ${
                    lit ? s.badge : 'bg-[#d9c9c6]'
                  }`}
                  aria-hidden="true"
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-extrabold">{s.label}</span>
                  <span className="block text-base font-semibold text-ink-soft">{s.note}</span>
                </span>
                {active && <WorkingDots />}
                {done && i < STEPS.length - 1 && (
                  <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-mint-ink text-sm font-black text-white" aria-hidden="true">
                    ✓
                  </span>
                )}
                <span className="sr-only">{done ? '(done)' : active ? '(in progress)' : ''}</span>
              </li>
            )
          })}
        </ol>

        <div className="min-h-5 flex-1" />

        <div className="flex justify-center px-6.5 pt-5">
          <p className="flex items-center gap-2.5 rounded-full border-2 border-dashed border-[#e3c3bf] px-4 py-2.5 text-[15px] font-bold text-ink-soft">
            <span className="size-[9px] flex-none rounded-full bg-mint" aria-hidden="true" />
            {finished ? 'All finished — you can go on!' : 'Please keep this screen open'}
          </p>
        </div>
        <p className="pb-5 pt-4 text-center text-[12px] font-semibold text-ink-muted">
          Powered by Phil-IRI Assessment Engine
        </p>
      </div>
    </div>
  )
}

function WorkingDots() {
  return (
    <span className="flex flex-none gap-1" aria-hidden="true">
      <span className="size-[7px] rounded-full bg-ink-soft motion-safe:animate-dot-bounce" />
      <span className="size-[7px] rounded-full bg-ink-soft motion-safe:animate-dot-bounce [animation-delay:150ms]" />
      <span className="size-[7px] rounded-full bg-ink-soft motion-safe:animate-dot-bounce [animation-delay:300ms]" />
    </span>
  )
}
