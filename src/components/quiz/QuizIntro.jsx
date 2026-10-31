import { ArrowRight, BookIcon, QuizCard, QuizPage, QuizPrimaryButton } from './QuizParts'

/** 1a — "Great reading! Now let's answer some questions about the story." */
export function QuizIntro({ storyTitle, onStart, onExit }) {
  return (
    <QuizPage onExit={onExit}>
      <QuizCard className="items-center px-6.5 pb-8 pt-9 text-center">
        <img src="/mascot-reading.svg" alt="" className="h-auto w-[132px]" />
        <p className="mt-5.5 text-[13px] font-extrabold tracking-[0.12em] text-ink-soft">GREAT READING!</p>
        <h1 className="mt-2 text-[30px] font-black leading-[1.2] text-pretty">
          Now let’s answer some questions about the story
        </h1>

        <div className="mt-7 flex w-full flex-col gap-2 text-left">
          <p className="text-[13px] font-extrabold tracking-[0.12em]">THE STORY</p>
          <div className="flex items-center gap-3 rounded-[14px] border-2 border-card-border bg-white p-4 text-brand">
            <BookIcon size={26} />
            <span className="text-[21px] font-extrabold text-ink">{storyTitle}</span>
          </div>
        </div>

        <p className="mt-4.5 text-[17px] leading-[1.45] text-ink-soft text-pretty">
          Answer each question as best you can. Take your time — there’s no rush.
        </p>

        <div className="min-h-6 flex-1" />
        <QuizPrimaryButton onClick={onStart} className="h-16 text-[22px] font-extrabold">
          Let’s Start
          <ArrowRight />
        </QuizPrimaryButton>
      </QuizCard>
    </QuizPage>
  )
}
