/**
 * sampleData.js — static stand-ins for the data that used to be read directly
 * from Supabase. All frontend data access is moving to the backend (see
 * store/api-endpoints.md); until those calls are wired in, usePassage and
 * useSessionHistory return these samples.
 *
 * Invented sample content: the passages are not Phil-IRI text.
 */

// Same shape usePassage returns: { id, text, wordCount }.
export const samplePassages = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    text: 'Lina has a red kite. She runs up the hill behind her house. The wind lifts the kite high above the mango trees. Her little dog barks and runs after it. Lina laughs and holds the string tight.',
    wordCount: 38,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    text: 'Ben helps his mother at the market every Saturday. He carries the bags of rice and counts the coins. When the work is done, they share a bowl of warm soup. Ben likes Saturdays the most.',
    wordCount: 36,
  },
]

// Same shape useSessionHistory returns: `sessions` rows, oldest → newest.
export const sampleSessions = [
  {
    learner_id: 'sample-learner',
    passage_id: samplePassages[0].id,
    session_timestamp: '2026-10-05T09:00:00.000Z',
    wpm: 47.2,
    word_recognition_pct: 84,
    reading_level: 'Frustration',
    correct: 84,
    mispronunciation: 6,
    substitution: 4,
    omission: 3,
    insertion: 1,
    repetition: 1,
    refusal_to_pronounce: 1,
    finger_pointing: true,
    loss_of_place: true,
    monotone_reading: true,
    word_by_word_reading: true,
    inaudible_reading: false,
  },
  {
    learner_id: 'sample-learner',
    passage_id: samplePassages[1].id,
    session_timestamp: '2026-10-12T09:00:00.000Z',
    wpm: 58.5,
    word_recognition_pct: 88,
    reading_level: 'Frustration',
    correct: 88,
    mispronunciation: 5,
    substitution: 3,
    omission: 2,
    insertion: 1,
    repetition: 1,
    refusal_to_pronounce: 0,
    finger_pointing: true,
    loss_of_place: false,
    monotone_reading: true,
    word_by_word_reading: true,
    inaudible_reading: false,
  },
  {
    learner_id: 'sample-learner',
    passage_id: samplePassages[0].id,
    session_timestamp: '2026-10-19T09:00:00.000Z',
    wpm: 71.8,
    word_recognition_pct: 93,
    reading_level: 'Instructional',
    correct: 93,
    mispronunciation: 3,
    substitution: 2,
    omission: 1,
    insertion: 0,
    repetition: 1,
    refusal_to_pronounce: 0,
    finger_pointing: true,
    loss_of_place: false,
    monotone_reading: true,
    word_by_word_reading: false,
    inaudible_reading: false,
  },
  {
    learner_id: 'sample-learner',
    passage_id: samplePassages[1].id,
    session_timestamp: '2026-10-26T09:00:00.000Z',
    wpm: 96.4,
    word_recognition_pct: 98,
    reading_level: 'Independent',
    correct: 98,
    mispronunciation: 1,
    substitution: 0,
    omission: 1,
    insertion: 0,
    repetition: 0,
    refusal_to_pronounce: 0,
    finger_pointing: false,
    loss_of_place: false,
    monotone_reading: false,
    word_by_word_reading: false,
    inaudible_reading: false,
  },
]
