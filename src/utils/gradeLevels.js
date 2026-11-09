// Grades a learner can register with (elementary Grades 1–6).
export const LEARNER_GRADES = [1, 2, 3, 4, 5, 6]

// Story grades available in the Phil-IRI passage bank (Grades 2–7).
// Used by the dashboard's passage grade picker.
export const PASSAGE_GRADES = [2, 3, 4, 5, 6, 7]

// Fallback when a learner has no registered grade (ReadRight targets Grade 4).
export const DEFAULT_GRADE = 4

// Nearest available story grade for a learner's grade (e.g. Grade 1 → 2).
export function toPassageGrade(grade) {
  const n = Number(grade)
  if (!Number.isFinite(n)) return DEFAULT_GRADE
  const min = PASSAGE_GRADES[0]
  const max = PASSAGE_GRADES[PASSAGE_GRADES.length - 1]
  return Math.min(max, Math.max(min, n))
}
