// Class strings for the sticker-style buttons (brown outline + solid ledge
// that presses down), shared by the reading flow's screens. They leave out
// height, padding, gap and text size so callers can set those without two
// classes fighting over the same property.

/** Big red main action. */
export const STICKER_PRIMARY =
  'flex w-full items-center justify-center rounded-2xl border-[3px] border-level-tile-edge bg-level-pill font-black text-white shadow-level-tile active:translate-y-1 active:shadow-none disabled:opacity-60'

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
