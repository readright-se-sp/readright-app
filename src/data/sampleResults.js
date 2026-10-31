/**
 * sampleResults.js — dev-only AssessmentResultJSON fixtures (npm run dev only).
 *
 * Used to review the UI without the FastAPI backend:
 *   /results                       → instructional (direct navigation, dev only)
 *   /results?sample=independent    → independent
 *   /results?sample=frustration    → frustration
 *   /results?sample=allMiscues     → every miscue type, with words to review
 *   add &first                     → also show the first-time results note
 *   ?fakeAnalysis on any page      → a full reading finishes with "instructional"
 *                                    (utils/devPreview.js)
 *
 * Shapes match the flat /analyze response (lib/api.js, lib/supabase.js), plus
 * the not-yet-sent optional fields comprehension_level / miscue_details on some
 * samples so those sections can be previewed. Samples are never saved.
 */
export const sampleResults = {
  // Every miscue type present, each with words to review (?sample=allMiscues).
  allMiscues: {
    wpm: 58.5,
    word_recognition_pct: 86,
    reading_level: 'Frustration',
    comprehension_level: 1,
    correct: 86,
    mispronunciation: 4,
    substitution: 3,
    omission: 2,
    insertion: 2,
    repetition: 2,
    refusal_to_pronounce: 1,
    miscue_details: {
      mispronunciation: [{ said: 'gar-deen', expected: 'garden', pronunciation: '/gar-den/', sentence: 'Lina played in the garden all day.' }],
      substitution: [{ said: 'horse', expected: 'house', sentence: 'She ran up the hill behind her house.' }],
      omission: [{ said: 'little', expected: 'the little dog', sentence: 'Then the little dog barked.' }],
      insertion: [{ said: 'very', expected: 'big', sentence: 'The big red kite flew away.' }],
      repetition: [{ said: 'the… the', expected: 'the', sentence: 'The kite rose high above the mango trees.' }],
      refusal_to_pronounce: [{ said: '(skipped)', expected: 'ribbons', pronunciation: '/rib-bunz/', sentence: 'It had a long tail made of ribbons.' }],
    },
    finger_pointing: true,
    loss_of_place: true,
    monotone_reading: true,
    word_by_word_reading: true,
    inaudible_reading: false,
  },
  independent: {
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
  instructional: {
    wpm: 71.8,
    word_recognition_pct: 93,
    reading_level: 'Instructional',
    // Not sent by /analyze yet — sample only, to preview the redesigned page.
    comprehension_level: 2,
    miscue_details: {
      mispronunciation: [
        { said: 'gar-deen', expected: 'garden', pronunciation: '/gar-den/', sentence: 'Lina played in the garden all day.' },
        { said: 'boll', expected: 'ball', pronunciation: '/bawl/', sentence: 'Bantay chased the ball far away.' },
      ],
      substitution: [
        { said: 'horse', expected: 'house', sentence: 'She ran up the hill behind her house.' },
      ],
      repetition: [
        { said: 'the… the', expected: 'the', sentence: 'The kite rose high above the mango trees.' },
      ],
    },
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
  frustration: {
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
    inaudible_reading: true,
  },
}
