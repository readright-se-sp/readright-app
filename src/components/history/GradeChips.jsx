/**
 * "All 12 · Grade 4 5 · Grade 3 7" filter chips. `value` is 'all' or a grade
 * number. The selected chip is filled and announced with aria-pressed.
 */
export function GradeChips({ total, grades, value, onChange }) {
  const chips = [{ key: 'all', label: 'All', count: total }, ...grades.map((g) => ({ key: g.grade, label: `Grade ${g.grade}`, count: g.count }))]

  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Show stories by grade">
      {chips.map((c) => {
        const on = c.key === value
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            aria-pressed={on}
            className={`flex min-h-12 items-center gap-2 rounded-full px-4.5 text-lg font-black active:translate-y-1 active:shadow-none ${
              on ? 'bg-brand text-white shadow-[0_4px_0_#7a1f1b]' : 'border-2 border-card-border bg-card text-ink shadow-card'
            }`}
          >
            {c.label}
            <span className={`rounded-full px-2 py-0.5 text-sm font-black ${on ? 'bg-white text-brand' : 'bg-[#f6e6e2] text-ink-soft'}`}>
              {c.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
