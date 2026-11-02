// Learner-facing labels + colours for the dashboard faces. Every state pairs a
// colour with a face and a text label (never colour alone).

// reading_level → weekly tile / past-reading row. Labels are the Phil-IRI level
// names, as on the results page. No red: Frustration uses amber.
export const LEVEL_FACES = {
  Independent: { label: 'Independent', mood: 'big', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink' },
  Instructional: { label: 'Instructional', mood: 'smile', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]' },
  Frustration: { label: 'Frustration', mood: 'flat', card: 'bg-[#fdf3d8]', border: 'border-amber', ink: 'text-[#7d5400]' },
}

// comprehension_level (1–3) → weekly tile. Matches the results-page wording.
export const COMPREHENSION_FACES = {
  1: { label: 'Keep going', mood: 'flat', card: 'bg-[#fdf3d8]', border: 'border-amber', ink: 'text-[#7d5400]' },
  2: { label: 'Good job', mood: 'smile', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]' },
  3: { label: 'Super reader', mood: 'big', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink' },
}

/** [3, 4] → "Grade 3 and Grade 4"; [2, 3, 4] → "Grade 2, Grade 3 and Grade 4". */
function gradeList(grades) {
  const names = grades.map((g) => `Grade ${g}`)
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
}

/**
 * "7 stories in Grade 3 and Grade 4", or just "7 stories" until sessions carry
 * `passage_grade`. `grades` comes from lib/dashboardStats → storyGrades().
 */
export function storiesSummary(count, grades) {
  const stories = `${count} ${count === 1 ? 'story' : 'stories'}`
  return grades.length > 0 ? `${stories} in ${gradeList(grades)}` : stories
}

/** "Nov 1" — the short date used on past readings. */
export function shortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
