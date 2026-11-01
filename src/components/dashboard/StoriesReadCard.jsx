/** "12 stories read" with this week's count beside it. */
export function StoriesReadCard({ total, thisWeek }) {
  return (
    <section className="flex items-center justify-between gap-3 rounded-3xl border-2 border-card-border bg-card px-4.5 py-4 shadow-card">
      <p className="flex items-baseline gap-2">
        <span className="text-[34px] font-black leading-none text-brand">{total}</span>
        <span className="text-[19px] font-black">{total === 1 ? 'story read' : 'stories read'}</span>
      </p>
      <span className="rounded-full bg-[#fff9f6] px-3.5 py-2 text-base font-extrabold text-ink-soft">This week: {thisWeek}</span>
    </section>
  )
}
