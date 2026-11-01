/**
 * useComprehensionQuiz — the comprehension questions shown after a reading.
 *
 * TODO(quiz questions): PLACEHOLDER. Returns the same sample questions for every
 * passage. Once the backend serves Phil-IRI comprehension questions,
 * fetch them here for `passage.id` (pure fetch in lib/api.js, state in this
 * hook) and keep this return shape.
 *
 * Question shape: { id, question, options: string[] } — 3 or 4 options. The
 * learner may also answer "I don't know" (recorded as choice 'idk').
 *
 * @param {object|null} passage — the passage that was just read
 * @returns {{ questions: object[], loading: boolean, error: Error|null }}
 */
// eslint-disable-next-line no-unused-vars -- passage is used once questions are fetched per passage
export function useComprehensionQuiz(passage) {
  return { questions: PLACEHOLDER_QUESTIONS, loading: false, error: null }
}

const PLACEHOLDER_QUESTIONS = [
  { id: 'placeholder-1', question: 'Who is the story about?', options: ['A girl named Lina', 'A boy named Sam', 'A farmer named Kiko'] },
  { id: 'placeholder-2', question: 'What color was Lina’s kite?', options: ['Blue and white', 'Red and yellow', 'Green and black'] },
  { id: 'placeholder-3', question: 'Why did Lina run up the hill?', options: ['To fly her new kite', 'To look for her dog', 'To pick ripe mangoes'] },
  { id: 'placeholder-4', question: 'Who ran after Lina?', options: ['Her little brother', 'Her dog, Bantay', 'Her best friend'] },
  { id: 'placeholder-5', question: 'Where did the kite fly?', options: ['Into the river', 'Above the mango trees', 'Over the school'] },
  { id: 'placeholder-6', question: 'How did Lina feel at the end of the story?', options: ['Sad', 'Scared', 'Happy'] },
]
