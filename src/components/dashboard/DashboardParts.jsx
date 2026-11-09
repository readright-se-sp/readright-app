/**
 * Small building blocks shared by the dashboard cards.
 */
import { useId } from 'react'
import { LISTEN_BUTTON } from '../ui/stickerStyles'

/** A five-point sparkle, positioned by the caller (`className` sets spot, size, colour). */
export function Star({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`pointer-events-none absolute ${className}`}>
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="currentColor" />
    </svg>
  )
}

/**
 * Soft white grid lines filling a sticker tile (parent must be `relative`).
 * `cell` is the square size in px, `color` and `opacity` the lines' colour and
 * strength, and `className` adds to the layer (e.g. -z-10 to sit behind the content).
 */
export function GridPattern({ cell = 18, color = 'white', opacity = 0.2, className = '' }) {
  // useId output has characters that break `url(#…)`, so keep only safe ones.
  const id = `grid-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg aria-hidden="true" className={`pointer-events-none absolute inset-0 size-full ${className}`}>
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
          <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const CARD_TONES = {
  peach: { card: 'bg-dash-card shadow-dash-card', blob: 'bg-dash-blob', pill: 'bg-level-pill text-white' },
  // A deeper shade of the running track's orange, so the white text reads clearly.
  mint: { card: 'bg-dash-mint shadow-dash-mint', blob: 'bg-dash-mint-blob', pill: 'bg-track-deep text-white' },
}

/**
 * "Sticker" card (peach by default, or `tone="mint"`): a coloured ledge along the bottom, a faint graph-paper
 * grid, a soft blob in the corner and a tilted pill beside the title. The grid
 * and blob sit behind everything else (isolate + -z-10), so they never draw
 * over the card's content.
 * `top` (e.g. a view switch) sits above the title.
 * `action` (e.g. a button) sits top-right; the corner sparkles are left out
 * then so they don't crowd it.
 */
export function PeachCard({ pill, title, action, top, tone = 'peach', children }) {
  const t = CARD_TONES[tone]
  return (
    <section className={`@container relative isolate flex flex-col gap-4 overflow-clip rounded-3xl p-4.5 ${t.card}`}>
      <span aria-hidden="true" className={`pointer-events-none absolute -right-12 -top-14 -z-10 size-44 rounded-full ${t.blob}`} />
      <GridPattern cell={24} opacity={0.45} className="-z-10" />
      {!action && (
        <>
          {/* In the card's edge padding, so a long title can never run under them. */}
          <Star className="right-1 top-11 size-3.5 text-level-pill" />
          <span aria-hidden="true" className="pointer-events-none absolute right-8 top-1.5 size-2 rounded-full bg-cta" />
        </>
      )}
      {top}
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className={`-rotate-3 rounded-full px-3 py-1 text-sm font-black ${t.pill}`}>{pill}</span>
          <h2 className="text-[21px] font-black leading-tight text-level-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * "Fly again" pill that replays a Lumi speed race: white with a brown outline +
 * ledge, or `green` like the Hear it buttons (on the dashboard's mint card).
 */
export function FlyAgainButton({ onClick, green = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[15px] font-black ${
        green
          ? LISTEN_BUTTON
          : 'border-[3px] border-level-tile-edge bg-white text-level-ink shadow-[0_3px_0_#8a4436] active:translate-y-0.5 active:shadow-[0_1px_0_#8a4436]'
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 10 12" className={`w-2.5 ${green ? 'fill-white' : 'fill-level-pill'}`}><path d="M0 0l10 6-10 6z" /></svg>
      Fly again
    </button>
  )
}

/** The standard dashboard card: soft fill, border and chunky bottom shadow. */
export function DashboardCard({ title, className = '', children, ...rest }) {
  return (
    <section
      className={`@container flex flex-col gap-3.5 rounded-3xl border-2 border-card-border bg-card p-4.5 shadow-card ${className}`}
      {...rest}
    >
      {title && <h2 className="text-[21px] font-black leading-tight">{title}</h2>}
      {children}
    </section>
  )
}

/** A simple face drawn in the current text colour: 'big' grin, 'smile' or 'flat'. */
export function Face({ mood, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" className="shrink-0">
      <circle cx="22" cy="22" r="20" fill="#fff9f6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="18" r="2.6" fill="currentColor" />
      <circle cx="28" cy="18" r="2.6" fill="currentColor" />
      {mood === 'big' && <path d="M13 25 Q22 35 31 25 Z" fill="currentColor" />}
      {mood === 'smile' && <path d="M15 26 Q22 32 29 26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />}
      {mood === 'flat' && <path d="M16 28 H28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />}
    </svg>
  )
}

/** A closed storybook: green cover with a white star, yellow pages, no outline. `className` sets its width. */
export function StoryBook({ className = 'w-10' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 48" className={`shrink-0 ${className}`}>
      <rect x="7" y="4" width="30" height="41" rx="3" fill="#ffd45c" />
      <rect x="3" y="2" width="30" height="42" rx="3" fill="#6cc36a" />
      <path d="M9 3v40" stroke="#3f8f45" strokeWidth="2.2" />
      <path d="M21 15.5l2 4.2 4.6.6-3.4 3.2.9 4.5-4.1-2.3-4.1 2.3.9-4.5-3.4-3.2 4.6-.6z" fill="#fff" />
    </svg>
  )
}

/** Dashed "Coming soon" box for sections still waiting on backend data. */
export function ComingSoon({ children }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-card-border px-4 py-5">
      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-level-ink">Coming soon</span>
      <p className="text-[17px] leading-[1.4] text-ink-soft">{children}</p>
    </div>
  )
}
