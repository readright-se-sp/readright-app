import { useReadAloud } from '../../hooks/useReadAloud'
import { QUIZ_LABELS } from './quizLabels'
import { LISTEN_BUTTON, LISTEN_PLAYING, SKY_CARD_FIXED, SOFT_PRIMARY, SOFT_SECONDARY } from '../ui/stickerStyles'
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
 * null) so the progress boxes can show which questions are answered. Tapping a
 * box calls `onJump` with its question's index.
 */
export function QuizQuestion({ question, index, answers, lang = 'en', tier = 'md', onAnswer, onJump, onPrevious, onNext, onExit }) {
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
    <QuizPage className={SKY_CARD_FIXED}>
      {/* ✕ + progress: one box per question, filled once answered (incl. "I don't know").
          Each is a tap target taller than its bar, which fits it to the 44px minimum. */}
      <div className="-mt-2 flex items-center gap-1">
        <QuizExitButton
          onClick={() => {
            stop()
            onExit()
          }}
        />
        <nav aria-label="Questions" className="flex flex-1">
          {answers.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}`}
              aria-current={i === index ? 'step' : undefined}
              className="flex min-h-11 min-w-0 flex-1 items-center px-[3px] active:opacity-70"
            >
              <span
                className={`h-3.5 w-full rounded-full ${a != null ? 'bg-score-amber' : 'bg-level-card'} ${
                  i === index ? 'ring-[3px] ring-cta ring-offset-1 ring-offset-white' : ''
                }`}
              />
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2.5">
        <p className="flex-none whitespace-nowrap rounded-full bg-sticker px-3 py-0.5 text-sm font-black tracking-[0.06em] text-level-ink">
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
      <div className="flex min-h-0 flex-1 flex-col overflow-auto pb-2 pt-3">
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
            <span className="flex-1 border-t-2 border-dashed border-cream-edge" />
            {L.or}
            <span className="flex-1 border-t-2 border-dashed border-cream-edge" />
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
              className={`flex size-8 items-center justify-center rounded-full text-[17px] font-black ${letterClass(selected === 'idk')}`}
            >
              ?
            </span>
            <span className={`${size.dontKnow} font-black`}>{L.dontKnow}</span>
            {selected === 'idk' && <ChosenMark />}
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex gap-3">
        <button type="button" onClick={onPrevious} className={`${SOFT_SECONDARY} min-h-[58px] flex-1 gap-1.5 px-2 text-[19px]`}>
          <ArrowLeft size={20} />
          {L.previous}
        </button>
        <button type="button" onClick={onNext} className={`${SOFT_PRIMARY} min-h-[58px] flex-[1.3] gap-1.5 px-2 text-[19px]`}>
          {L.next}
          <ArrowRight size={20} />
        </button>
      </div>
    </QuizPage>
  )
}

// Chosen: blue card, blue letter and a dot mark (never colour alone). Blue and a
// dot say "picked" without hinting at right or wrong, as red or a ✓ would.
// Being read aloud: yellow card with a speaker.
function cardClass(selected, reading = false) {
  const base = 'text-level-ink active:translate-y-0.5 active:shadow-none'
  if (selected) return `${base} bg-result-blue shadow-ledge-blue`
  if (reading) return `${base} bg-shelf-card shadow-ledge-yellow`
  return `${base} bg-sticker shadow-cream-button`
}

function letterClass(selected) {
  return selected ? 'bg-tile-blue text-white' : 'bg-cream-edge text-level-ink'
}

/** Radio dot on the chosen answer, so the choice shows without relying on colour. */
function ChosenMark() {
  return (
    <span aria-hidden="true" className="flex size-7 flex-none items-center justify-center rounded-full border-[3px] border-tile-blue bg-white">
      <span className="size-3 rounded-full bg-tile-blue" />
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
        className={`flex flex-none items-center justify-center rounded-full font-black ${letterSize} ${letterClass(selected)}`}
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
