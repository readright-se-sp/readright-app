import { CheckIcon } from '../icons'
import { SKY_CARD_FIXED, SOFT_SECONDARY } from '../ui/stickerStyles'
import { ArrowRight, QuizPage, QuizPrimaryButton } from './QuizParts'

/**
 * 1j — "Check your answers". Blank questions are yellow cards with a
 * "!" (a nudge, not an error); answered ones — including "I don't know" — stay
 * quiet but tappable to change. When something is blank, the main button
 * jumps to the first blank and "Submit anyway" stays available: no pop-up,
 * the learner is never blocked from finishing.
 *
 * `answers[i]` is the option index, 'idk' or null (blank).
 */
export function QuizReview({ questions, answers, onOpenQuestion, onSubmit, onExit }) {
  const blankCount = answers.filter((a) => a == null).length
  const firstBlank = answers.findIndex((a) => a == null)

  return (
    <QuizPage onExit={onExit} className={SKY_CARD_FIXED}>
      <h1 className="-mt-2 flex min-h-12 items-center pl-14 text-[24px] font-black leading-tight text-level-ink">Check your answers</h1>
      <p className="mt-1.5 text-center text-[17px] font-bold leading-[1.4] text-coral-ink">Tap a question to go back to it.</p>

      {/* Scrolls inside the card, so the buttons stay in view however long the list is. */}
      <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-auto pb-1.5">
        {questions.map((q, i) => (
          <li key={q.id}>
            {answers[i] == null ? (
              <BlankRow number={i + 1} question={q.question} onClick={() => onOpenQuestion(i)} />
            ) : (
              <AnsweredRow number={i + 1} question={q.question} onClick={() => onOpenQuestion(i)} />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-2.5">
        {blankCount > 0 ? (
          <>
            <QuizPrimaryButton onClick={() => onOpenQuestion(firstBlank)} className="min-h-16 text-[21px]">
              Answer question {firstBlank + 1}
              <ArrowRight />
            </QuizPrimaryButton>
            <button
              type="button"
              onClick={onSubmit}
              className={`${SOFT_SECONDARY} mt-3 min-h-14 px-4 text-lg`}
            >
              Submit anyway
            </button>
          </>
        ) : (
          <QuizPrimaryButton onClick={onSubmit} className="min-h-16 text-[21px]">
            Submit my answers
          </QuizPrimaryButton>
        )}
      </div>
    </QuizPage>
  )
}

function BlankRow({ number, question, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-shelf-card px-3.5 py-3 text-left text-level-ink shadow-ledge-yellow active:translate-y-0.5 active:shadow-none"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-white text-[17px] font-black">
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-base font-black text-result-olive">
          <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-cta text-[13px] font-black text-level-ink">
            !
          </span>
          Not answered yet
        </span>
        <span className="mt-0.5 block text-base font-bold leading-[1.3]">{question}</span>
      </span>
      <span className="flex-none text-level-pill">
        <ArrowRight size={20} />
      </span>
    </button>
  )
}

function AnsweredRow({ number, question, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-sticker px-3.5 py-2.5 text-left text-level-ink shadow-cream-button active:translate-y-0.5 active:shadow-none"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-white text-[17px] font-black">
        {number}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 text-base font-bold leading-[1.3]">{question}</span>
      <span className="flex flex-none items-center gap-1 rounded-full bg-result-green py-0.5 pl-1 pr-2.5 text-sm font-black text-goal">
        <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-goal text-white [&>svg]:size-3">
          <CheckIcon />
        </span>
        Done
      </span>
    </button>
  )
}
