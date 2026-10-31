import { useReadAloud } from '../../hooks/useReadAloud'
import { QUIZ_LABELS } from './quizLabels'
import { ArrowLeft, ArrowRight, QuizExitButton, QuizPage, SpeakerIcon } from './QuizParts'

// Text/card sizes per grade tier (design states 1f Grade 1, 1b Grade 3, 1g Grade 6).
// Full class strings so Tailwind can see them.
const SIZES = {
  lg: { question: 'text-[30px]', option: 'min-h-[76px] px-3.5 py-3 text-[27px] leading-[1.35]', letter: 'size-[42px] text-[22px]', dontKnow: 'text-[21px]', list: 'mt-4.5 gap-2.5', or: 'mb-3 mt-4' },
  md: { question: 'text-[25px]', option: 'min-h-[66px] px-3.5 py-3 text-[21px] leading-[1.35]', letter: 'size-[38px] text-[19px]', dontKnow: 'text-[19px]', list: 'mt-4.5 gap-2.5', or: 'mb-3 mt-4' },
  sm: { question: 'text-[21px]', option: 'min-h-[58px] px-3 py-2 text-[17px] leading-[1.28]', letter: 'size-[34px] text-[17px]', dontKnow: 'text-[17px]', list: 'mt-3 gap-2', or: 'mb-2 mt-2.5' },
}

const LETTERS = 'abcd'

/**
 * 1b–1h — one question: progress boxes, read-aloud, answer cards, "I don't
 * know", Previous / Next. Render with `key={index}` so moving to
 * another question remounts it and the read-aloud hook cancels any speech.
 *
 * `answers` is the full array (one entry per question: option index, 'idk' or
 * null) so the progress boxes can show which questions are answered.
 */
export function QuizQuestion({ question, index, answers, lang = 'en', tier = 'md', onAnswer, onPrevious, onNext, onExit }) {
  const L = QUIZ_LABELS[lang] ?? QUIZ_LABELS.en
  const size = SIZES[tier] ?? SIZES.md
  const total = answers.length
  const selected = answers[index]
  const { supported, playing, readingIdx, play, stop } = useReadAloud(L.voice)

  function toggleReadAloud() {
    if (playing) {
      stop()
      return
    }
    play([
      { idx: -1, text: question.question },
      ...question.options.map((text, i) => ({ idx: i, text: `${LETTERS[i]}. ${text}` })),
    ])
  }

  return (
    <QuizPage>
      {/* ✕ + progress: one box per question, filled once answered (incl. "I don't know"). */}
      <div className="-ml-1 -mt-2 flex items-center gap-2.5">
        <QuizExitButton
          onClick={() => {
            stop()
            onExit()
          }}
        />
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-md ${a != null ? 'bg-brand' : 'bg-[#ead6d3]'} ${
                i === index ? 'ring-2 ring-brand ring-offset-2 ring-offset-[#f4e8e6]' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2.5">
        <p className="flex-none whitespace-nowrap text-[15px] font-extrabold tracking-[0.06em] text-ink-soft">
          {L.progress(index + 1, total)}
        </p>
        {supported &&
          (playing ? (
            <button
              type="button"
              onClick={toggleReadAloud}
              className="flex h-11 min-w-[44px] flex-none items-center gap-2.5 whitespace-nowrap rounded-full bg-brand pl-3.5 pr-4 text-base font-extrabold text-white shadow-[0_3px_0_#871f1a]"
            >
              <span className="flex h-4.5 items-center gap-[3px]" aria-hidden="true">
                <span className="h-2 w-[3px] rounded-sm bg-white" />
                <span className="h-4 w-[3px] rounded-sm bg-white" />
                <span className="h-[11px] w-[3px] rounded-sm bg-white" />
                <span className="h-4.5 w-[3px] rounded-sm bg-white" />
                <span className="h-[9px] w-[3px] rounded-sm bg-white" />
              </span>
              {L.stop}
              <span className="size-2.5 rounded-[2px] bg-white" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleReadAloud}
              className="flex h-11 min-w-[44px] flex-none items-center gap-2 whitespace-nowrap rounded-full border-2 border-card-border bg-white pl-3 pr-4 text-base font-extrabold text-brand"
            >
              <SpeakerIcon />
              {L.readAloud}
            </button>
          ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto pt-4">
        <h1 id={`q-${question.id}`} className={`${size.question} font-black leading-[1.3] text-pretty`}>
          {question.question}
        </h1>

        <div role="radiogroup" aria-labelledby={`q-${question.id}`} className={`flex flex-col ${size.list}`}>
          {question.options.map((text, i) => (
            <AnswerCard
              key={i}
              letter={LETTERS[i]}
              text={text}
              selected={selected === i}
              reading={readingIdx === i}
              sizeClass={size.option}
              letterClass={size.letter}
              onClick={() => onAnswer(i)}
            />
          ))}

          <div className={`flex items-center gap-3 text-sm font-bold text-ink-soft ${size.or}`} aria-hidden="true">
            <span className="h-[1.5px] flex-1 bg-card-border" />
            {L.or}
            <span className="h-[1.5px] flex-1 bg-card-border" />
          </div>

          <button
            type="button"
            role="radio"
            aria-checked={selected === 'idk'}
            onClick={() => onAnswer('idk')}
            className={`flex min-h-14 items-center justify-center gap-2.5 rounded-[18px] px-4 py-2.5 ${cardClass(selected === 'idk')}`}
          >
            <span
              aria-hidden="true"
              className={`flex size-7 items-center justify-center rounded-full text-[17px] font-black ${letterClass(selected === 'idk')}`}
            >
              ?
            </span>
            <span className={`${size.dontKnow} font-extrabold`}>{L.dontKnow}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-[58px] flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-card-border bg-white text-[19px] font-extrabold text-brand"
        >
          <ArrowLeft size={20} />
          {L.previous}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex h-[58px] flex-[1.3] items-center justify-center gap-1.5 rounded-full bg-brand text-[19px] font-extrabold text-white shadow-[0_5px_0_#871f1a] active:translate-y-1 active:shadow-[0_1px_0_#871f1a]"
        >
          {L.next}
          <ArrowRight size={20} />
        </button>
      </div>
    </QuizPage>
  )
}

function cardClass(selected, reading = false) {
  if (selected) return 'border-[2.5px] border-brand bg-[#fbecea] shadow-[0_3px_0_#e3b9b4]'
  if (reading) return 'border-2 border-dashed border-brand bg-[#fcf3f1] shadow-[0_3px_0_#eeddda]'
  return 'border-2 border-card-border bg-white shadow-[0_3px_0_#eeddda]'
}

function letterClass(selected) {
  return selected ? 'bg-brand text-white' : 'bg-[#f4e8e6] text-brand'
}

function AnswerCard({ letter, text, selected, reading, sizeClass, letterClass: letterSize, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-center gap-3.5 rounded-[18px] text-left ${sizeClass} ${cardClass(selected, reading)}`}
    >
      <span
        aria-hidden="true"
        className={`flex flex-none items-center justify-center rounded-full font-black ${letterSize} ${letterClass(selected)}`}
      >
        {letter}
      </span>
      <span className="flex-1 font-bold text-pretty">{text}</span>
      {reading && (
        <span className="flex-none text-brand">
          <SpeakerIcon waves={1} />
        </span>
      )}
    </button>
  )
}
