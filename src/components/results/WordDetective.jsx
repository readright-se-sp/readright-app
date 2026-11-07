import { useState } from 'react'
import { Star } from '../dashboard/DashboardParts'
import { CheckIcon } from '../icons'
import { MISCUE_TYPES } from './resultsCopy'
import { WordReviewSheet } from './WordReviewSheet'

/**
 * "Word Detective" — one sticker box per Phil-IRI miscue type with its count.
 * A type with no mistakes is a dashed cream box with a check and "None!".
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
      <h2 className="relative mx-1 inline-block pr-8 text-[26px] font-black text-level-ink">
        Word Detective
        <Star className="right-0 top-1.5 size-6 text-cta" />
      </h2>
      <p className="mx-1 mb-3.5 text-base font-bold text-level-muted">
        {canReview ? 'Tap a box to listen to your tricky words.' : 'Here are the kinds of tricky words Lumi found.'}
      </p>
      <div className="grid grid-cols-2 gap-3">
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
              className={`flex min-h-32 flex-col gap-1 rounded-[20px] px-3 py-3 text-left ${
                none ? 'border-[3px] border-dashed border-dash-line bg-sticker' : `border-[3px] ${t.edge} ${t.card} ${t.ledge}`
              } ${tappable ? 'active:translate-y-1 active:shadow-none' : ''}`}
            >
              <span className="mb-1 flex w-full items-center justify-between gap-1">
                <span
                  className={`flex size-10 items-center justify-center rounded-full text-lg font-black text-white ${
                    none ? 'bg-mint' : t.dot
                  }`}
                >
                  {none ? <CheckIcon /> : count}
                </span>
                {(none || tappable) && (
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-black ${
                      none ? 'bg-white text-level-ink' : 'bg-listen text-white'
                    }`}
                  >
                    {none ? 'None!' : 'Listen ›'}
                  </span>
                )}
              </span>
              <span className="text-[17px] font-black leading-tight">{t.name}</span>
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
