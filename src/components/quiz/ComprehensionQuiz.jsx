import { useState } from 'react'
import { useComprehensionQuiz } from '../../hooks/useComprehensionQuiz'
import { sizeTierForGrade } from './quizLabels'
import { QuizIntro } from './QuizIntro'
import { QuizQuestion } from './QuizQuestion'
import { QuizReview } from './QuizReview'
import { QuizDone } from './QuizDone'

/**
 * ComprehensionQuiz — the questions shown right after "I'm done!", while the
 * reading is analyzed in the background (SessionScreen keeps the analysis
 * running and only moves to results once the learner finishes here).
 *
 * Flow: intro → questions → review → done → onFinish(answers).
 * `onExit` is the ✕ on every screen but "done"; the parent confirms before leaving.
 * No timer or score is shown to the learner.
 *
 * `onFinish` receives one entry per question:
 *   { question_id, choice } where choice is the option index, 'idk' or null.
 * TODO(quiz answers): nothing stores these yet — the backend will decide where.
 */
export function ComprehensionQuiz({ passage, grade, lang = 'en', onFinish, onExit }) {
  const { questions } = useComprehensionQuiz(passage)
  const [screen, setScreen] = useState('intro') // intro | question | review | done
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => questions.map(() => null))

  const storyTitle = passage?.title ?? "Today's Story"
  const tier = sizeTierForGrade(grade)

  function answer(choice) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? choice : a)))
  }

  // Once the learner has opened a question from the review, Next jumps to the
  // next blank after it and back to the review when there are none left,
  // instead of walking through every question again. Forward-only, so skipping
  // blanks can't loop — it always ends back on the review.
  const [fixingBlanks, setFixingBlanks] = useState(false)

  function goTo(i) {
    setIndex(i)
    setScreen('question')
  }

  function openFromReview(i) {
    setFixingBlanks(true)
    goTo(i)
  }

  function next() {
    if (fixingBlanks) {
      const blank = answers.findIndex((a, i) => i > index && a == null)
      if (blank === -1) setScreen('review')
      else goTo(blank)
      return
    }
    if (index === questions.length - 1) setScreen('review')
    else goTo(index + 1)
  }

  if (screen === 'intro') {
    return <QuizIntro storyTitle={storyTitle} onStart={() => goTo(0)} onExit={onExit} />
  }

  if (screen === 'review') {
    return (
      <QuizReview
        questions={questions}
        answers={answers}
        onOpenQuestion={openFromReview}
        onSubmit={() => setScreen('done')}
        onExit={onExit}
      />
    )
  }

  if (screen === 'done') {
    return (
      <QuizDone
        onContinue={() =>
          onFinish(questions.map((q, i) => ({ question_id: q.id, choice: answers[i] })))
        }
      />
    )
  }

  return (
    <QuizQuestion
      key={index}
      question={questions[index]}
      index={index}
      answers={answers}
      lang={lang}
      tier={tier}
      onAnswer={answer}
      onPrevious={() => (index === 0 ? setScreen('intro') : goTo(index - 1))}
      onNext={next}
      onExit={onExit}
    />
  )
}
