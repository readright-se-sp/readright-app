import { ArrowRight, QuizPage, QuizPrimaryButton } from './QuizParts'

/**
 * 1j — "Check your answers". Blank questions are highlighted in soft amber
 * (a nudge, not an error); answered ones — including "I don't know" — stay
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
    <QuizPage onExit={onExit}>
      <h1 className="text-[29px] font-black leading-[1.2]">Check your answers</h1>
      <p className="mt-1 text-[17px] leading-[1.4] text-ink-soft">Tap a question to go back to it.</p>

      <ul className="mt-4 flex flex-col gap-2.5">
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

      {/* Buttons stay pinned to the bottom so they're reachable however long the list is. */}
      <div className="sticky bottom-0 -mx-5 mt-auto bg-[#f4e8e6] px-5 pb-4 pt-4">
        {blankCount > 0 ? (
          <>
            <QuizPrimaryButton onClick={() => onOpenQuestion(firstBlank)} className="h-16 text-[21px] font-extrabold">
              Answer question {firstBlank + 1}
              <ArrowRight />
            </QuizPrimaryButton>
            <button
              type="button"
              onClick={onSubmit}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-full border-2 border-card-border bg-white py-3 text-[18px] font-extrabold text-brand"
            >
              Submit anyway
            </button>
          </>
        ) : (
          <QuizPrimaryButton onClick={onSubmit} className="h-16 text-[21px] font-extrabold">
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
      className="flex min-h-16 w-full items-center gap-3 rounded-[18px] border-2 border-amber/60 bg-peach px-3.5 py-3 text-left"
    >
      <span className="flex size-8.5 flex-none items-center justify-center rounded-full bg-white text-[17px] font-black text-brand">
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-base font-extrabold text-ink-soft">
          <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-amber text-[13px] font-black text-white">
            !
          </span>
          Not answered yet
        </span>
        <span className="mt-0.5 block text-base font-bold leading-[1.3]">{question}</span>
      </span>
      <span className="flex-none text-brand">
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
      className="flex min-h-14 w-full items-center gap-3 rounded-[18px] border-2 border-card-border bg-white px-3.5 py-2.5 text-left"
    >
      <span className="flex size-8.5 flex-none items-center justify-center rounded-full bg-[#f4e8e6] text-[17px] font-black text-brand">
        {number}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 text-base font-bold leading-[1.3]">{question}</span>
      <span className="flex flex-none items-center gap-1.5 text-base font-extrabold text-ink-soft">
        <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-mint-ink text-white">
          <CheckIcon size={12} />
        </span>
        Done
      </span>
    </button>
  )
}

function CheckIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}
