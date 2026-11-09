import { SkyCardPage } from '../ui/SkyCardPage'
import { ArrowRight, QuizPrimaryButton } from './QuizParts'

/** 1k — "Great job, you're done!" → on to the reading results. */
export function QuizDone({ onContinue }) {
  return (
    <SkyCardPage title="Great job, you’re done!" subtitle="Thank you for reading with us. Let’s see how you did!" className="text-center">
      <QuizPrimaryButton onClick={onContinue} className="mt-6 min-h-16 text-[22px]">
        See my results
        <ArrowRight />
      </QuizPrimaryButton>
    </SkyCardPage>
  )
}
