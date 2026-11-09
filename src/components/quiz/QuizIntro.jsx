import { Star } from '../dashboard/DashboardParts'
import { ArrowRight, BookIcon, QuizCard, QuizPage, QuizPrimaryButton } from './QuizParts'

/** 1a — "Great reading! Now let's answer some questions about the story." */
export function QuizIntro({ storyTitle, onStart, onExit }) {
  return (
    // Taller than its content where the screen allows, with the space shared between the sections.
    <QuizPage circle onExit={onExit} className="min-h-[min(calc(100dvh-1rem-env(safe-area-inset-top)),540px)]">
      <QuizCard className="relative items-center justify-between text-center">
        <div className="flex flex-col items-center">
          <img src="/mascot-head-icon.svg" alt="" className="mt-4 h-[72px] w-auto motion-safe:animate-lumi-bob [@media(max-height:680px)]:h-[60px]" />
          <h1 className="relative mt-5 whitespace-nowrap text-[38px] font-black leading-[1.1] text-level-pill">
            <Star className="-left-5 -top-3 size-6 text-cta motion-safe:animate-glitter" />
            Great reading!
            <Star className="-bottom-1 -right-5 size-6 text-cta motion-safe:animate-glitter motion-safe:[animation-delay:0.5s]" />
          </h1>
          <p className="mt-2.5 text-lg font-bold leading-snug text-level-ink text-pretty">
            Now let’s answer some questions about the story
          </p>
        </div>

        <div className="mt-5 w-full">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-result-blue px-4 py-3 text-left shadow-ledge-blue">
            <span className="flex size-11 flex-none items-center justify-center rounded-full bg-white text-tile-blue-ink">
              <BookIcon size={22} />
            </span>
            <span className="min-w-0 text-[20px] font-black leading-tight text-level-ink">{storyTitle}</span>
          </div>

          <p className="mt-4.5 text-[17px] font-bold leading-[1.45] text-level-muted text-pretty">
            Take your time there’s no rush.
          </p>
        </div>

        <QuizPrimaryButton onClick={onStart} className="mt-5 min-h-16 text-[22px]">
          Let’s Start
          <ArrowRight />
        </QuizPrimaryButton>
      </QuizCard>
    </QuizPage>
  )
}
