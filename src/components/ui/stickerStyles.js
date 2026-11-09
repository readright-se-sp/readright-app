// Class strings for the sticker-style buttons (brown outline + solid ledge
// that presses down), shared by the reading flow's screens. They leave out
// height, padding, gap and text size so callers can set those without two
// classes fighting over the same property.

/** Big red main action. */
export const STICKER_PRIMARY =
  'flex w-full items-center justify-center rounded-2xl border-[3px] border-level-tile-edge bg-level-pill font-black text-white shadow-level-tile active:translate-y-1 active:shadow-none disabled:opacity-60'

/** The same main action in the dashboard's softer style: no outline, a darker red ledge. */
export const SOFT_PRIMARY =
  'flex w-full items-center justify-center rounded-2xl bg-level-pill font-black text-white shadow-[0_5px_0_var(--color-brand)] active:translate-y-1 active:shadow-none disabled:opacity-60'

/** Cream second choice in the same softer style. */
export const SOFT_SECONDARY =
  'flex w-full items-center justify-center rounded-2xl border-[3px] border-cream-edge bg-cream-button font-black text-level-ink shadow-cream-button active:translate-y-0.5 active:shadow-none disabled:opacity-60'

/** SkyCardPage height for the camera screens: all of a phone, capped on bigger screens. */
export const SKY_CARD_TALL =
  'min-h-[calc(100dvh-1rem-env(safe-area-inset-top))] sm:min-h-[min(calc(100dvh-1rem-env(safe-area-inset-top)),780px)]'

/** The same height held fixed, so a long list scrolls inside the card and its buttons stay in view. */
export const SKY_CARD_FIXED =
  'h-[calc(100dvh-1rem-env(safe-area-inset-top))] sm:h-[min(calc(100dvh-1rem-env(safe-area-inset-top)),780px)]'

/** A camera box filling its @container-size slot: all of it on phones, the camera's own shape from sm:. */
export const CAMERA_BOX =
  'h-full w-full sm:aspect-[var(--video-ratio)] sm:h-auto sm:w-[min(100cqw,calc(100cqh*var(--video-ratio)))]'

/**
 * Green "tap to hear" button (Hear it, Listen, Read aloud) — kept apart from
 * the red main action. Colours only: callers set shape and size.
 */
export const LISTEN_BUTTON =
  'border-[3px] border-listen-edge bg-listen text-white shadow-listen active:translate-y-1 active:shadow-none'

/** The same button while its sound is playing (tap again to stop). */
export const LISTEN_PLAYING =
  'border-[3px] border-listen-deep bg-listen-edge text-white shadow-listen-deep active:translate-y-1 active:shadow-none'

/** White second choice next to or under the main action. */
export const STICKER_SECONDARY =
  'flex w-full items-center justify-center rounded-2xl border-[3px] border-level-tile-edge bg-white font-black text-level-ink shadow-level-tile active:translate-y-1 active:shadow-none disabled:opacity-60'
