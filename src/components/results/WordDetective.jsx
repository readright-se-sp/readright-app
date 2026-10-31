import { useState } from 'react'
import { MISCUE_TYPES } from './resultsCopy'
import { WordReviewSheet } from './WordReviewSheet'

/**
 * "Word Detective" — one box per Phil-IRI miscue type with its count.
 *
 * A box opens the word-review sheet only when the result includes the actual
 * words for that type: `result.miscue_details[type]` = [{ said, expected,
 * pronunciation?, sentence?, said_audio_url? }].
 * TODO(miscue details): /analyze returns counts only today; the backend will add
 * miscue_details (and said_audio_url clips of the learner's voice) later.
 */
export function WordDetective({ result }) {
  const [openKey, setOpenKey] = useState(null)
  const details = result.miscue_details ?? {}
  const canReview = MISCUE_TYPES.some((t) => details[t.key]?.length)
  const openType = MISCUE_TYPES.find((t) => t.key === openKey)

  return (
    <section>
      <h2 className="mx-1 text-[21px] font-black">Word Detective</h2>
      <p className="mx-1 mb-3 text-[15px] font-semibold text-ink-soft">
        {canReview ? 'Tap a box to listen to your tricky words.' : 'Here are the kinds of tricky words Lumi found.'}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {MISCUE_TYPES.map((t) => {
          const count = Math.round(result[t.key] ?? 0)
          const words = details[t.key] ?? []
          const none = count === 0
          const tappable = !none && words.length > 0
          const Box = tappable ? 'button' : 'div'
          return (
            <Box
              key={t.key}
              {...(tappable ? { type: 'button', onClick: () => setOpenKey(t.key) } : {})}
              className={`flex min-h-28 flex-col gap-1.5 rounded-[20px] border-2 px-3 py-3.5 text-left ${
                none ? 'border-[#ece4e2] bg-[#f7f4f3]' : `${t.border} ${t.card}`
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span
                  className={`flex size-[38px] items-center justify-center rounded-full text-[19px] font-black text-white ${
                    none ? 'bg-[#b8c9be]' : t.dot
                  }`}
                >
                  {none ? '✓' : count}
                </span>
                {none && <span className="text-[13px] font-black text-[#6f8a78]">None!</span>}
                {tappable && <span className={`text-[13px] font-black ${t.ink}`}>Listen ›</span>}
              </span>
              <span className="text-base font-black leading-tight">{t.name}</span>
              <span className="text-sm font-semibold leading-tight text-ink-soft">{t.desc}</span>
            </Box>
          )
        })}
      </div>

      {openType && (
        <WordReviewSheet type={openType} words={details[openType.key]} onClose={() => setOpenKey(null)} />
      )}
    </section>
  )
}
