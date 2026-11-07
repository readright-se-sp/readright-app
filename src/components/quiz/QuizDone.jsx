import { Star } from '../dashboard/DashboardParts'
import { ArrowRight, QuizCard, QuizPage, QuizPrimaryButton } from './QuizParts'

/** 1k — "Great job, you're done!" → on to the reading results. */
export function QuizDone({ onContinue }) {
  return (
    <QuizPage className="pt-10">
      <QuizCard className="items-center px-5.5 pb-6 pt-9 text-center">
        <div className="flex-1" />
        <div className="relative flex size-[200px] items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-level-blob" />
          <Star className="-right-1 top-3 size-8 text-cta" />
          <Star className="bottom-6 -left-2 size-6 text-coral" />
          <img src="/mascot-reading.svg" alt="" className="relative w-40 motion-safe:animate-lumi-bob" />
        </div>
        <h1 className="mt-6 text-[32px] font-black leading-[1.2] text-level-ink text-pretty">Great job, you’re done!</h1>
        <p className="mt-2.5 text-lg font-bold leading-[1.5] text-coral-ink text-pretty">
          Thank you for reading with us. Let’s see how you did!
        </p>
        <div className="min-h-6 flex-[1.3]" />
        <QuizPrimaryButton onClick={onContinue} className="min-h-16 text-[22px]">
          See my results
          <ArrowRight />
        </QuizPrimaryButton>
      </QuizCard>
    </QuizPage>
  )
}
