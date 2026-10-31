import { ArrowRight, QuizCard, QuizPage, QuizPrimaryButton } from './QuizParts'

/** 1k — "Great job, you're done!" → on to the reading results. */
export function QuizDone({ onContinue }) {
  return (
    <QuizPage className="pt-10">
      <QuizCard className="items-center px-6.5 pb-8 pt-9 text-center">
        <div className="flex-1" />
        <img src="/mascot-reading.svg" alt="" className="h-auto w-40" />
        <h1 className="mt-6.5 text-[32px] font-black leading-[1.2] text-pretty">Great job, you’re done!</h1>
        <p className="mt-3 text-lg leading-[1.5] text-ink-soft text-pretty">
          Thank you for reading with us. Let’s see how you did!
        </p>
        <div className="min-h-6 flex-[1.3]" />
        <QuizPrimaryButton onClick={onContinue} className="h-16 text-[22px] font-extrabold">
          See my results
          <ArrowRight />
        </QuizPrimaryButton>
      </QuizCard>
    </QuizPage>
  )
}
