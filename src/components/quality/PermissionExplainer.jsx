import { SkyCardPage } from '../ui/SkyCardPage'
import { SOFT_PRIMARY } from '../ui/stickerStyles'

/**
 * PermissionExplainer — the in-app explanation shown BEFORE the browser's
 * native camera/microphone prompt (GO1 'pending' / 'requesting' states).
 *
 * Tapping "Allow" calls onAllow, which triggers getUserMedia (and therefore the
 * native prompt). While the request is in flight, `requesting` disables the
 * button so a double-tap can't open two prompts.
 *
 * On the same white sky card as /pre-session.
 */
export function PermissionExplainer({ onAllow, requesting }) {
  return (
    <SkyCardPage title="Let's get ready to read!" className="items-center text-center">
      <p className="relative mt-2.5 text-[17px] font-bold leading-[1.45] text-level-muted">
        ReadRight needs your camera and microphone to check your recording
        environment and capture your reading.
      </p>

      <button
        type="button"
        onClick={onAllow}
        disabled={requesting}
        className={`${SOFT_PRIMARY} mt-6 min-h-14 gap-2.5 px-4 text-xl`}
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
    </SkyCardPage>
  )
}
