import { COMPREHENSION } from './resultsCopy'
import { starPoints } from '../../utils/starPoints'

/**
 * "Did you understand the story?" — the comprehension quiz result, as a
 * compact cream sticker card under the Reading Aloud Score: the face for the
 * learner's level beside the question, the level's name and its message
 * (never colour alone). Only rendered when the result carries a
 * comprehension_level (1–3).
 */
export function ComprehensionCard({ level }) {
  const copy = COMPREHENSION[level]
  if (!copy) return null

  return (
    <section className="relative isolate flex items-center gap-4 rounded-3xl bg-sticker p-5 shadow-cream-edge">
      <SparkleFrame ink={copy.ink} />
      <Face fill={copy.face} mouth={copy.mouth} />
      <div className={`flex min-w-0 flex-col gap-0.5 ${copy.ink}`}>
        <h2 className="text-sm font-black uppercase tracking-[0.06em]">Did you understand the story?</h2>
        <p className="text-xl font-black leading-tight">{copy.title}</p>
        <p className="text-base font-bold leading-[1.3] text-pretty">{copy.message}</p>
      </div>
    </section>
  )
}

// Sparkles sit on the frame's double line, in pairs (big + small), centred
// 7px in from the card edge, between the two lines. Full class strings so
// Tailwind can see them.
const SPARKLES = [
  { at: 'top-[7px] left-[58%]', size: 14 },
  { at: 'top-[7px] left-[51%]', size: 10 },
  { at: 'top-[calc(100%-7px)] left-[40%]', size: 14 },
  { at: 'top-[calc(100%-7px)] left-[47%]', size: 10 },
  { at: 'left-[7px] top-[62%]', size: 14 },
  { at: 'left-[7px] top-[36%]', size: 9 },
  { at: 'left-[calc(100%-7px)] top-[34%]', size: 14 },
  { at: 'left-[calc(100%-7px)] top-[64%]', size: 10 },
]

/**
 * Decorative double-line frame with four-point sparkles, in the level's text
 * colour. Each sparkle sits on a patch of the card's cream so the lines break
 * around it.
 */
function SparkleFrame({ ink }) {
  return (
    // Clipped to the card so the cream patches never spill onto the ledge or the card below.
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-clip rounded-3xl ${ink}`}>
      <div className="absolute inset-1.25 rounded-[19px] border-[1.5px] border-current opacity-45" />
      <div className="absolute inset-2.25 rounded-[15px] border-[1.5px] border-current opacity-45" />
      {SPARKLES.map(({ at, size }) => (
        <span
          key={at}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-sticker p-0.75 ${at}`}
        >
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M12 0C12.7 7.6 16.4 11.3 24 12C16.4 12.7 12.7 16.4 12 24C11.3 16.4 7.6 12.7 0 12C7.6 11.3 11.3 7.6 12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  )
}

/**
 * A happy face with pink cheeks, filled with the level colour. Closed eyes with
 * a smile or grin, or, for 'wow' (Super Reader), yellow star eyes and a wide
 * open grin with a tongue.
 */
function Face({ fill, mouth }) {
  const ink = 'var(--color-level-ink)'
  const star = 'var(--color-result-face-star)'
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="size-[72px] flex-none">
      <circle cx="22" cy="22" r="21" className={fill} />
      {mouth === 'wow' ? (
        <>
          {/* Each star pulses around its own centre; still for reduced motion. */}
          <polygon points={starPoints(14.5, 16.5)} fill={star} stroke={star} strokeWidth="1.2" strokeLinejoin="round" className="origin-center transform-fill motion-safe:animate-star-pulse" />
          <polygon points={starPoints(29.5, 16.5)} fill={star} stroke={star} strokeWidth="1.2" strokeLinejoin="round" className="origin-center transform-fill motion-safe:animate-star-pulse" />
        </>
      ) : (
        <path d="M12.5 19.5Q15.5 15 18.5 19.5M25.5 19.5Q28.5 15 31.5 19.5" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      )}
      {mouth === 'wow' && (
        <>
          <path d="M14 25Q22 23.5 30 25Q29.5 36 22 36Q14.5 36 14 25Z" fill="var(--color-result-face-mouth)" />
          <path d="M17 33.2Q22 29.5 27 33.2Q25 36 22 36Q19 36 17 33.2Z" fill="#ef6f84" />
        </>
      )}
      {mouth === 'grin' && <path d="M14 25Q22 35 30 25Z" fill={ink} />}
      {mouth === 'smile' && <path d="M15 26Q22 32 29 26" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />}
      <ellipse cx="10.5" cy="26" rx="3" ry="2" fill="#ff9fb0" />
      <ellipse cx="33.5" cy="26" rx="3" ry="2" fill="#ff9fb0" />
    </svg>
  )
}
