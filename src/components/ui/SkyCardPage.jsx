import { Star } from '../dashboard/DashboardParts'
import { StickerExitButton } from './ExitButton'
import { SkyBackground } from './SkyBackground'

/**
 * The white card on a blue sky over a forest, used by the screens before
 * reading starts. Centred and compact so it fits one screen with no scrolling.
 * `title` (optional) adds a heading, with `subtitle` below it. `lumi` shows
 * Lumi's head above the heading; turn it off for a plain heading level with the
 * ✕. `circle` is the soft circle with sparkles at the top of the card, on by
 * default when Lumi shows. `onExit` (optional) adds the corner ✕, with
 * `exitLabel` for its screen-reader name, and `className` adds to the card (e.g.
 * a minimum height).
 */
export function SkyCardPage({ title, subtitle, lumi = true, circle = lumi, onExit, exitLabel, className = '', children }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-sky-bottom px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] font-display text-ink sm:px-3">
      <SkyBackground forest />

      <div className={`relative flex w-full max-w-[480px] flex-col overflow-clip rounded-[32px] bg-white px-3 pb-4 pt-5 shadow-ledge-blue sm:px-4.5 ${className}`}>
        {/* Big soft circle at the top, with a few sparkles. */}
        {circle && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[130px]">
            <span className="absolute -top-[190px] left-1/2 size-[300px] -translate-x-1/2 rounded-full bg-level-blob" />
            <Star className="right-[13%] top-[34px] size-7 text-coral" />
            <span className="absolute left-[22%] top-[60px] size-2.5 rounded-full bg-cta" />
            <span className="absolute right-[22%] top-[60px] size-3 rounded-full bg-tile-blue" />
          </div>
        )}

        {/* Always a way out — e.g. when the camera can't be turned on. */}
        {onExit && (
          <header className="absolute left-3 top-3 z-10 sm:left-4.5">
            <StickerExitButton soft onClick={onExit} label={exitLabel} />
          </header>
        )}

        {title && (
          <div className="relative flex flex-col items-center text-center">
            {lumi && <img src="/mascot-head-icon.svg" alt="" className="mb-1.5 h-[72px] w-auto motion-safe:animate-lumi-bob [@media(max-height:680px)]:h-[52px]" />}
            <h1 className="text-[28px] font-black leading-tight text-level-ink">{title}</h1>
            {subtitle && <p className="text-[17px] font-bold text-coral-ink">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
