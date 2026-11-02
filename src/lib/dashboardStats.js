/**
 * dashboardStats — pure aggregation helpers for the Progress Dashboard (RR-042 / RR-049).
 * Kept out of the components so they stay simple and unit-testable.
 *
 * Input is the `sessions` rows from useSessionHistory (oldest → newest). Weeks
 * start on Monday and use the device's local time.
 *
 * Placeholders the team still has to decide are marked TODO:
 *   TODO(weekly level)  — how one week's reading level is measured
 */
import { behaviorRows } from './philIri'

export const WEEK_LABELS = ['3 weeks ago', '2 weeks ago', 'Last week', 'This week']

const DAY_MS = 86_400_000

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date) {
  const d = startOfDay(date)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // back to Monday
  return d
}

// Whole-day number, so consecutive days differ by exactly 1 (rounding absorbs DST).
function dayNumber(date) {
  return Math.round(startOfDay(date).getTime() / DAY_MS)
}

/**
 * The last four weeks (oldest first), each with the sessions read in it.
 * @returns {{ label: string, sessions: object[] }[]}
 */
export function lastFourWeeks(sessions, now = new Date()) {
  const thisWeek = startOfWeek(now)
  const weeks = WEEK_LABELS.map((label, i) => {
    const start = new Date(thisWeek)
    start.setDate(start.getDate() - 7 * (WEEK_LABELS.length - 1 - i))
    return { label, start, sessions: [] }
  })
  for (const s of sessions) {
    const t = new Date(s.session_timestamp)
    const week = weeks.findLast((w) => t >= w.start)
    if (week) week.sessions.push(s)
  }
  return weeks.map(({ label, sessions: list }) => ({ label, sessions: list }))
}

/** Days in a row with at least one reading. `current` stays alive until a full day is missed. */
export function readingStreaks(sessions, now = new Date()) {
  const days = [...new Set(sessions.map((s) => dayNumber(new Date(s.session_timestamp))))].sort((a, b) => a - b)
  const daySet = new Set(days)

  let best = 0
  let run = 0
  days.forEach((day, i) => {
    run = i > 0 && day === days[i - 1] + 1 ? run + 1 : 1
    best = Math.max(best, run)
  })

  const today = dayNumber(now)
  let day = daySet.has(today) ? today : today - 1
  let current = 0
  while (daySet.has(day)) {
    current += 1
    day -= 1
  }
  return { current, best }
}

/**
 * TODO(weekly level): placeholder — uses the level of the week's most recent
 * reading until the team picks a measure (e.g. average word-recognition score).
 * @returns {'Independent'|'Instructional'|'Frustration'|null}
 */
export function weekReadingLevel(weekSessions) {
  return weekSessions.at(-1)?.reading_level ?? null
}

/** Average words per minute for the week, or null with no readings. */
export function weekWpm(weekSessions) {
  if (weekSessions.length === 0) return null
  return Math.round(weekSessions.reduce((sum, s) => sum + (s.wpm ?? 0), 0) / weekSessions.length)
}

/** Average comprehension level (1–3) for the week, or null when none was scored. */
export function weekComprehension(weekSessions) {
  const scored = weekSessions.filter((s) => s.comprehension_level != null)
  if (scored.length === 0) return null
  return Math.round(scored.reduce((sum, s) => sum + s.comprehension_level, 0) / scored.length)
}

/** True once any session carries a comprehension score (TODO(comprehension score): backend). */
export function hasComprehension(sessions) {
  return sessions.some((s) => s.comprehension_level != null)
}

/**
 * The words the learner misread most often, from each session's
 * `miscue_details` ({ type: [{ said, expected }] }). Returns null when no
 * session has miscue_details yet — TODO(miscue details): the backend doesn't
 * send or save them yet — so the card can show "Coming soon".
 * @returns {{ word: string, said?: string, times: number }[] | null}
 */
export function trickyWords(sessions, limit = 3) {
  if (!sessions.some((s) => s.miscue_details)) return null
  const byWord = new Map()
  for (const s of sessions) {
    for (const list of Object.values(s.miscue_details ?? {})) {
      for (const entry of list ?? []) {
        const word = entry.expected?.trim()
        if (!word) continue
        const key = word.toLowerCase()
        const item = byWord.get(key) ?? { word, times: 0 }
        item.times += 1
        if (entry.said) item.said = entry.said // sessions are oldest → newest, so this keeps the latest
        byWord.set(key, item)
      }
    }
  }
  return [...byWord.values()].sort((a, b) => b.times - a.times).slice(0, limit)
}

/**
 * The story grades the learner has read, lowest first (e.g. [3, 4]). Empty
 * until sessions carry `passage_grade` — TODO(passage grade): not saved yet.
 */
export function storyGrades(sessions) {
  return [...new Set(sessions.map((s) => s.passage_grade).filter((g) => g != null))].sort((a, b) => a - b)
}

/**
 * The reading habit seen most often in the last few readings (a behaviour-flag
 * key, e.g. 'monotone_reading'), or null when none was seen — the card then praises.
 */
export function habitToPractice(sessions, recent = 3) {
  const last = sessions.slice(-recent)
  let pick = null
  let most = 0
  for (const { key } of behaviorRows) {
    const seen = last.filter((s) => s[key]).length
    if (seen > most) {
      pick = key
      most = seen
    }
  }
  return pick
}
