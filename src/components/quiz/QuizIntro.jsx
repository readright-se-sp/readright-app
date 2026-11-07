import { ArrowRight, BookIcon, QuizCard, QuizPage, QuizPrimaryButton } from './QuizParts'

/** 1a — "Great reading! Now let's answer some questions about the story." */
export function QuizIntro({ storyTitle, onStart, onExit }) {
  return (
    <QuizPage onExit={onExit}>
      <QuizCard className="items-center px-5.5 pb-6 pt-7 text-center">
        <span className="flex size-[150px] items-center justify-center rounded-full bg-level-blob">
          <img src="/mascot-reading.svg" alt="" className="h-auto w-[116px] motion-safe:animate-lumi-bob" />
        </span>
        <p className="mt-4 rounded-full bg-level-pill px-3 py-0.5 text-sm font-black uppercase tracking-[0.06em] text-white">
          Great reading!
        </p>
        <h1 className="mt-3 text-[28px] font-black leading-[1.2] text-level-ink text-pretty">
          Now let’s answer some questions about the story
        </h1>

        <div className="mt-6 flex w-full items-center gap-3 rounded-2xl border-[3px] border-level-tile-edge bg-result-blue px-4 py-3.5 text-left">
          <span className="flex size-11 flex-none items-center justify-center rounded-full border-[3px] border-level-tile-edge bg-white text-tile-blue-ink">
            <BookIcon size={22} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black uppercase tracking-[0.06em] text-tile-blue-ink">The story</span>
            <span className="block text-[20px] font-black leading-tight text-level-ink">{storyTitle}</span>
          </span>
        </div>

        <p className="mt-4.5 text-[17px] font-bold leading-[1.45] text-level-muted text-pretty">
          Answer each question as best you can. Take your time — there’s no rush.
        </p>

        <div className="min-h-6 flex-1" />
        <QuizPrimaryButton onClick={onStart} className="min-h-16 text-[22px]">
          Let’s Start
          <ArrowRight />
        </QuizPrimaryButton>
      </QuizCard>
    </QuizPage>
  )
}
