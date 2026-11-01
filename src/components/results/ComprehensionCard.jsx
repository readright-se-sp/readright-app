import { COMPREHENSION } from './resultsCopy'

// One face per level, low → high. Drawn with plain shapes (no image assets).
const FACES = {
  1: { face: 'bg-[#f6c14b] border-amber', ink: 'bg-[#3a2a1e]', line: 'border-[#3a2a1e]', mouth: 'small' },
  2: { face: 'bg-[#a9bef0] border-sky', ink: 'bg-[#1f2a4a]', line: 'border-[#1f2a4a]', mouth: 'smile' },
  3: { face: 'bg-mint-light border-mint-ink', ink: 'bg-[#173823]', line: 'border-[#173823]', mouth: 'grin' },
}

/**
 * "Did you understand the story?" — the comprehension quiz result: the face for
 * the learner's level plus a message card naming it (never colour alone). Only
 * rendered when the result carries a comprehension_level (1–3).
 */
export function ComprehensionCard({ level }) {
  const copy = COMPREHENSION[level]
  if (!copy) return null

  return (
    <section className="rounded-[24px] border-[1.5px] border-[#f0d8d2] bg-white px-4 pb-4 pt-4.5">
      <h2 className="text-center text-[13px] font-black uppercase tracking-[0.06em] text-ink-soft">
        Did you understand the story?
      </h2>
      <div className="mb-3 mt-4 flex justify-center" aria-hidden="true">
        <Face {...FACES[level]} />
      </div>
      <div className={`rounded-2xl px-3.5 py-3 text-center ${copy.card}`}>
        <p className={`text-[19px] font-black ${copy.ink}`}>{copy.title}</p>
        <p className="mt-0.5 text-[15px] font-semibold text-ink-soft text-pretty">{copy.message}</p>
      </div>
    </section>
  )
}

function Face({ face, ink, line, mouth }) {
  return (
    <span className={`relative block size-16 scale-115 rounded-full border-[3px] ${face}`}>
      <span className={`absolute left-4 top-5 h-2.5 w-2 rounded-full ${ink}`} />
      <span className={`absolute right-4 top-5 h-2.5 w-2 rounded-full ${ink}`} />
      {mouth === 'grin' ? (
        <span className={`absolute left-3.5 top-[30px] h-3.5 w-7 rounded-b-2xl ${ink}`} />
      ) : (
        <span
          className={`absolute top-[30px] rounded-b-[14px] border-b-4 ${line} ${
            mouth === 'smile' ? 'left-4 h-3 w-6' : 'left-5 h-1.5 w-4'
          }`}
        />
      )}
    </span>
  )
}
