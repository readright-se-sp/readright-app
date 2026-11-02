import { useReadAloud } from '../../hooks/useReadAloud'
import { QUIZ_LABELS } from './quizLabels'
import { LISTEN_BUTTON, LISTEN_PLAYING, STICKER_PRIMARY, STICKER_SECONDARY } from '../ui/stickerStyles'
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
      <div className="flex items-center gap-3">
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
              className={`h-3.5 flex-1 rounded-full border-2 border-level-tile-edge ${a != null ? 'bg-level-pill' : 'bg-white'} ${
                i === index ? 'ring-[3px] ring-cta ring-offset-1 ring-offset-level-card' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2.5">
        <p className="flex-none whitespace-nowrap rounded-full border-2 border-level-tile-edge bg-white px-3 py-0.5 text-sm font-black tracking-[0.06em] text-level-ink">
          {L.progress(index + 1, total)}
        </p>
        {supported &&
          (playing ? (
            <button
              type="button"
              onClick={toggleReadAloud}
              className={`flex min-h-11 min-w-[44px] flex-none items-center gap-2.5 whitespace-nowrap rounded-full pl-3.5 pr-4 text-base font-black ${LISTEN_PLAYING}`}
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
              className={`flex min-h-11 min-w-[44px] flex-none items-center gap-2 whitespace-nowrap rounded-full pl-3 pr-4 text-base font-black ${LISTEN_BUTTON}`}
            >
              <SpeakerIcon />
              {L.readAloud}
            </button>
          ))}
      </div>

      {/* pb-2 leaves room for the last card's ledge, which the scroll area would clip. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto pt-4 pb-2">
        <h1 id={`q-${question.id}`} className={`${size.question} font-black leading-[1.3] text-level-ink text-pretty`}>
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

          <div className={`flex items-center gap-3 text-sm font-black text-level-muted ${size.or}`} aria-hidden="true">
            <span className="flex-1 border-t-2 border-dashed border-level-edge" />
            {L.or}
            <span className="flex-1 border-t-2 border-dashed border-level-edge" />
          </div>

          <button
            type="button"
            role="radio"
            aria-checked={selected === 'idk'}
            onClick={() => onAnswer('idk')}
            className={`flex min-h-14 items-center justify-center gap-2.5 rounded-2xl px-4 py-2.5 ${cardClass(selected === 'idk')}`}
          >
            <span
              aria-hidden="true"
              className={`flex size-8 items-center justify-center rounded-full border-2 border-level-tile-edge text-[17px] font-black ${letterClass(selected === 'idk')}`}
            >
              ?
            </span>
            <span className={`${size.dontKnow} font-black`}>{L.dontKnow}</span>
            {selected === 'idk' && <ChosenMark />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onPrevious} className={`${STICKER_SECONDARY} min-h-[58px] flex-1 gap-1.5 px-2 text-[19px]`}>
          <ArrowLeft size={20} />
          {L.previous}
        </button>
        <button type="button" onClick={onNext} className={`${STICKER_PRIMARY} min-h-[58px] flex-[1.3] gap-1.5 px-2 text-[19px]`}>
          {L.next}
          <ArrowRight size={20} />
        </button>
      </div>
    </QuizPage>
  )
}

// Chosen: pink card, red letter and a ✓ mark (never colour alone). Being read
// aloud: dashed yellow card with a speaker.
function cardClass(selected, reading = false) {
  const base = 'border-[3px] border-level-tile-edge text-level-ink active:translate-y-1 active:shadow-none'
  if (selected) return `${base} bg-result-pink shadow-level-tile`
  if (reading) return `${base} border-dashed bg-shelf-card shadow-level-tile`
  return `${base} bg-white shadow-level-tile`
}

function letterClass(selected) {
  return selected ? 'bg-level-pill text-white' : 'bg-level-card text-level-ink'
}

/** ✓ on the chosen answer, so the choice shows without relying on colour. */
function ChosenMark() {
  return (
    <span aria-hidden="true" className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-level-tile-edge bg-goal text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 4 4L19 7" />
      </svg>
    </span>
  )
}

function AnswerCard({ letter, text, selected, reading, sizeClass, letterClass: letterSize, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-center gap-3.5 rounded-2xl text-left ${sizeClass} ${cardClass(selected, reading)}`}
    >
      <span
        aria-hidden="true"
        className={`flex flex-none items-center justify-center rounded-full border-2 border-level-tile-edge font-black ${letterSize} ${letterClass(selected)}`}
      >
        {letter}
      </span>
      <span className="flex-1 font-bold text-pretty">{text}</span>
      {reading && (
        <span className="flex-none text-level-pill">
          <SpeakerIcon waves={1} />
        </span>
      )}
      {selected && <ChosenMark />}
    </button>
  )
}
