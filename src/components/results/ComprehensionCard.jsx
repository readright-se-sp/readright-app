import { COMPREHENSION } from './resultsCopy'

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
    <section className="flex items-center gap-4 rounded-3xl bg-sticker p-4 shadow-cream-edge">
      <Face fill={copy.face} mouth={copy.mouth} />
      <div className={`flex min-w-0 flex-col gap-0.5 ${copy.ink}`}>
        <h2 className="text-sm font-black uppercase tracking-[0.06em]">Did you understand the story?</h2>
        <p className="text-xl font-black leading-tight">{copy.title}</p>
        <p className="text-base font-bold leading-[1.3] text-pretty">{copy.message}</p>
      </div>
    </section>
  )
}

/** A happy face with closed eyes and pink cheeks, filled with the level colour. */
function Face({ fill, mouth }) {
  const ink = 'var(--color-level-ink)'
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="size-[72px] flex-none">
      <circle cx="22" cy="22" r="21" className={fill} />
      <path d="M12.5 19.5Q15.5 15 18.5 19.5M25.5 19.5Q28.5 15 31.5 19.5" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      {mouth === 'grin'
        ? <path d="M14 25Q22 35 30 25Z" fill={ink} />
        : <path d="M15 26Q22 32 29 26" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />}
      <ellipse cx="10.5" cy="26" rx="3" ry="2" fill="#ff9fb0" />
      <ellipse cx="33.5" cy="26" rx="3" ry="2" fill="#ff9fb0" />
    </svg>
  )
}
