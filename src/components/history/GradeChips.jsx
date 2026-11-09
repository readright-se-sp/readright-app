/**
 * "All 12 · Grade 4 5 · Grade 3 7" filter chips: cream with a soft tan
 * outline + ledge, like the other small buttons. `value` is 'all' or a grade number. The selected
 * chip turns yellow with a darker yellow edge, like the chosen grade in the
 * story-level picker, and is announced with aria-pressed.
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
            className={`flex min-h-12 items-center gap-2 rounded-full border-[3px] px-4 text-lg font-black text-level-ink active:translate-y-0.5 active:shadow-none ${
              on
                ? 'border-track-yellow-edge bg-track-yellow shadow-[0_3px_0_var(--color-track-yellow-edge)]'
                : 'border-cream-edge bg-cream-button shadow-cream-button'
            }`}
          >
            {c.label}
            {/* Yellow count on the cream chips; white on the yellow (selected) one so it still shows. */}
            <span className={`rounded-full px-2 py-0.5 text-sm font-black text-level-ink ${on ? 'bg-white' : 'bg-track-yellow'}`}>
              {c.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
