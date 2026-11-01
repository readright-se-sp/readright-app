/** "3 days in a row 🔥". */
export function StreakCard({ streak }) {
  return (
    <section className="rounded-3xl border-2 border-card-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3 rounded-2xl bg-peach p-3.5">
        <span className="text-[30px] leading-none" aria-hidden="true">🔥</span>
        <span className="text-[19px] font-black leading-tight">
          {streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'} in a row` : 'Read today to start a streak!'}
        </span>
      </div>
    </section>
  )
}
