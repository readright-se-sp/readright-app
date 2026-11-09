import { SkyCardPage } from '../ui/SkyCardPage'
import { SOFT_PRIMARY } from '../ui/stickerStyles'

/**
 * PermissionDenied — recovery screen when the camera/microphone could not be
 * started (GO1 'denied' state). One screen whose guidance switches on the
 * classified `errorKind` (and `platform` for the permission case).
 *
 * Accessibility: the failure is signalled with BOTH an icon AND a text title —
 * never colour alone. Copy is plain, age-appropriate, and always ends with a
 * concrete action the learner can take.
 *
 * Sticker style like /dashboard, on the same white sky card as /pre-session.
 *
 * @param {{ platform: 'ios'|'android'|'other', errorKind: string|null, onRetry: () => void }} props
 */
export function PermissionDenied({ platform, errorKind, onRetry }) {
  const content = getContent(errorKind, platform)

  return (
    <SkyCardPage className="items-center text-center">
      {/* Warning illustration — crossed-out camera on yellow, not colour alone */}
      <div className="relative mb-3 flex size-20 items-center justify-center rounded-full bg-shelf-card text-result-olive [@media(max-height:680px)]:size-14">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>

      <h1 className="text-[26px] font-black leading-tight text-level-ink">
        {content.title}
      </h1>

      {content.steps ? (
        <ol className="mt-4 flex w-full flex-col gap-2.5 text-left">
          {content.steps.map((step, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-sticker px-3 py-2 text-base font-bold leading-snug text-level-ink shadow-cream-button">
              <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-cta text-base font-black">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="sr-only">Step {i + 1}: </span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2.5 text-[17px] font-bold leading-[1.45] text-level-muted">
          {content.message}
        </p>
      )}

      {content.note && (
        <p className="mt-4 w-full rounded-2xl bg-shelf-card px-4 py-3 text-left text-[15px] font-bold leading-snug text-level-ink shadow-ledge-yellow">
          {content.note}
        </p>
      )}

      <button type="button" onClick={onRetry} className={`${SOFT_PRIMARY} mt-5 min-h-14 px-4 text-xl`}>
        Try Again
      </button>
    </SkyCardPage>
  )
}

function getContent(errorKind, platform) {
  if (errorKind === 'permission') {
    if (platform === 'ios') {
      return {
        title: 'We need to see and hear you',
        steps: [
          'Tap the "AA" button at the top of the screen.',
          'Tap "Website Settings".',
          'Set Camera and Microphone to "Allow".',
          'Come back and tap Try Again.',
        ],
        note: 'You can also open the Settings app, then Safari, then turn Camera and Microphone to Allow.',
      }
    }
    return {
      title: 'We need to see and hear you',
      steps: [
        'Tap the lock icon next to the web address at the top.',
        'Tap "Permissions".',
        'Turn Camera and Microphone on.',
        'Tap Try Again.',
      ],
    }
  }

  if (errorKind === 'notfound') {
    return {
      title: 'No camera found',
      message:
        "We can't find a camera on this device. Try ReadRight on a phone or tablet that has a camera, then tap Try Again.",
    }
  }

  if (errorKind === 'inuse') {
    return {
      title: 'Your camera is busy',
      message:
        'Another app may be using your camera. Close your other camera or video apps, then tap Try Again.',
    }
  }

  if (errorKind === 'insecure') {
    return {
      title: 'This page is not secure',
      message:
        'ReadRight needs a secure link to use your camera. Open ReadRight using an https link, then tap Try Again.',
    }
  }

  return {
    title: 'Something stopped your camera',
    message: 'We could not start your camera. Tap Try Again.',
  }
}
