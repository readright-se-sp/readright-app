import { StickerPage } from '../ui/StickerPage'
import { STICKER_PRIMARY } from '../ui/stickerStyles'

/**
 * PermissionExplainer — the in-app explanation shown BEFORE the browser's
 * native camera/microphone prompt (GO1 'pending' / 'requesting' states).
 *
 * Tapping "Allow" calls onAllow, which triggers getUserMedia (and therefore the
 * native prompt). While the request is in flight, `requesting` disables the
 * button so a double-tap can't open two prompts.
 *
 * Sticker style like /pre-session: peach page, brown-outlined card with a ledge.
 */
export function PermissionExplainer({ onAllow, requesting }) {
  return (
    <StickerPage className="justify-center pt-8">
      <div className="flex flex-col items-center rounded-3xl border-[3px] border-level-tile-edge bg-sticker px-6 pb-6 pt-8 text-center shadow-level-tile">
        {/* Camera + mic illustration */}
        <div className="relative mb-5 flex size-30 items-center justify-center rounded-full bg-level-blob" aria-hidden="true">
          <img src="/mascot-reading.svg" alt="" className="w-[88px]" />
          <span className="absolute -bottom-1 -right-1 flex size-12 items-center justify-center rounded-full border-[3px] border-level-tile-edge bg-result-blue text-tile-blue-ink">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
              <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
              <path d="m15.5 10.5 6-3.5v10l-6-3.5z" />
            </svg>
          </span>
        </div>

        <h1 className="text-[28px] font-black leading-tight text-level-ink">
          Let&apos;s get ready to read!
        </h1>
        <p className="mt-2.5 text-[17px] font-bold leading-[1.45] text-level-muted">
          ReadRight needs your camera and microphone to check your recording
          environment and capture your reading.
        </p>

        <button
          type="button"
          onClick={onAllow}
          disabled={requesting}
          className={`${STICKER_PRIMARY} mt-7 min-h-14 gap-2.5 px-4 text-xl`}
        >
          {requesting ? (
            'Asking…'
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" />
                <path d="m15.5 10.5 6-3.5v10l-6-3.5z" />
              </svg>
              <span>Turn on camera &amp; mic</span>
            </>
          )}
        </button>
      </div>
    </StickerPage>
  )
}
