// Learner-facing copy for the comprehension quiz, per passage language.
// English is the default; Filipino matches the design's "Filipino · Grade 3" state.
export const QUIZ_LABELS = {
  en: {
    voice: 'en-US',
    readAloud: 'Read aloud',
    stop: 'Stop',
    or: 'or',
    dontKnow: 'I don’t know',
    previous: 'Previous',
    next: 'Next',
    progress: (current, total) => `QUESTION ${current} OF ${total}`,
  },
  fil: {
    voice: 'fil-PH',
    readAloud: 'Pakinggan',
    stop: 'Ihinto',
    or: 'o',
    dontKnow: 'Hindi ko alam',
    previous: 'Bumalik',
    next: 'Susunod',
    progress: (current, total) => `TANONG ${current} SA ${total}`,
  },
}

// Text size tier by the learner's grade: younger learners get bigger text and
// taller answer cards (design: Grade 1 / Grade 3 / Grade 6 states).
export function sizeTierForGrade(grade) {
  const g = Number(grade)
  if (g <= 2) return 'lg'
  if (g >= 5) return 'sm'
  return 'md'
}
