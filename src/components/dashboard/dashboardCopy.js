// Learner-facing labels + colours for the dashboard faces. Every state pairs a
// colour with a face and a text label (never colour alone).

// Weekly-tile colours per face (WeeklyFacesCard): soft tile + filled face for
// past weeks, a strong tile + darker text for "This week". (Green levels use
// the 'big' mood, whose face is always cream, so GREEN has no faceFill.)
const GREEN = { tile: 'bg-[#e6f5df]', strong: 'bg-[#9dd889]', strongInk: 'text-[#1d5a30]' }
const BLUE = { tile: 'bg-[#e9eefc]', faceFill: '#87a3ea', strong: 'bg-[#a9c0f4]', strongInk: 'text-[#1f3a7a]' }
const AMBER = { tile: 'bg-[#fdf1d3]', faceFill: '#f5c656', strong: 'bg-[#f6cf6b]', strongInk: 'text-[#5e3f00]' }

// reading_level → weekly tile / past-reading row. Labels are the Phil-IRI level
// names, as on the results page. No red: Frustration uses amber.
export const LEVEL_FACES = {
  Independent: { label: 'Independent', mood: 'big', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink', ...GREEN },
  Instructional: { label: 'Instructional', mood: 'smile', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]', ...BLUE },
  Frustration: { label: 'Frustration', mood: 'flat', card: 'bg-[#fdf3d8]', border: 'border-amber', ink: 'text-[#7d5400]', ...AMBER },
}

// comprehension_level (1–3) → weekly tile. Matches the results-page wording.
export const COMPREHENSION_FACES = {
  1: { label: 'Keep going', mood: 'flat', card: 'bg-[#fdf3d8]', border: 'border-amber', ink: 'text-[#7d5400]', ...AMBER },
  2: { label: 'Good job', mood: 'smile', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]', ...BLUE },
  3: { label: 'Super reader', mood: 'big', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink', ...GREEN },
}

/** "Nov 1" — the short date used on past readings. */
export function shortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Short habit tips for the dashboard's square tile, by behaviour-flag key.
// The longer wording stays on the results page (results/resultsCopy HABITS).
export const HABIT_TIPS = {
  finger_pointing: 'Try reading with just your eyes.',
  loss_of_place: 'Read at a steady pace.',
  monotone_reading: 'Make your voice go up and down.',
  word_by_word_reading: 'Read words in little groups.',
  inaudible_reading: 'Read a little louder.',
}
