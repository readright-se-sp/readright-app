/** "12 stories read" + what the number counts. */
export function StoriesReadCard({ total }) {
  return (
    <section className="flex flex-col gap-1 rounded-3xl border-2 border-card-border bg-card px-4.5 py-4 shadow-card">
      <p className="flex items-baseline gap-2">
        <span className="text-[34px] font-black leading-none text-brand">{total}</span>
        <span className="text-[19px] font-black">{total === 1 ? 'story read' : 'stories read'}</span>
      </p>
      <p className="text-base font-semibold text-ink-soft">All the stories you have finished since you started.</p>
    </section>
  )
}
