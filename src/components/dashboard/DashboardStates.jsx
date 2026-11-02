/**
 * The dashboard's non-data states. Start Reading stays pinned below all of them, so
 * a learner can always begin a story.
 */

const PREVIEWS = [
  { glyph: '3', title: 'Your streak', sub: 'Read on more days in a row.' },
  { glyph: '↑', title: 'How fast Lumi flies', sub: 'Watch your speed grow.' },
]

/** First time: no readings yet. */
export function DashboardEmpty() {
  return (
    <>
      <section className="flex flex-col items-center gap-3.5 px-3 pb-2 pt-5 text-center">
        <img src="/mascot-reading.svg" alt="" className="w-32 motion-safe:animate-lumi-bob" />
        <p className="max-w-[290px] text-[22px] font-black leading-tight text-balance">
          Read your first story to see your progress here!
        </p>
        <p className="max-w-[300px] text-[17px] text-ink-soft">
          Lumi will keep track of your streak, your speed and your tricky words.
        </p>
      </section>
      <ul className="flex flex-col gap-3 opacity-75" aria-hidden="true">
        {PREVIEWS.map((p) => (
          <li key={p.title} className="flex items-center gap-3.5 rounded-[20px] border-2 border-dashed border-card-border px-4.5 py-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f6e6e2] text-[22px] font-black text-ink-muted">
              {p.glyph}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-lg font-extrabold text-ink-soft">{p.title}</span>
              <span className="text-base text-ink-muted">{p.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

/** The history query failed. */
export function DashboardError({ onRetry }) {
  return (
    <section
      role="alert"
      className="flex flex-col items-center gap-3.5 rounded-3xl border-2 border-card-border bg-peach px-5 py-6 text-center shadow-card"
    >
      <img src="/mascot-reading.svg" alt="" className="w-[76px]" />
      <h2 className="text-[22px] font-black">Your progress didn’t load</h2>
      <p className="max-w-[300px] text-[17px] leading-[1.45] text-ink-soft">
        We couldn’t load your progress. Check your internet and tap Try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[52px] min-w-[180px] rounded-2xl border-2 border-brand bg-[#fff9f6] px-6 text-[19px] font-black text-brand shadow-[0_4px_0_#dfbfbc] active:translate-y-1 active:shadow-none"
      >
        Try again
      </button>
      <p className="text-base text-ink-muted">You can still start a story above.</p>
    </section>
  )
}

const SKELETONS = [
  { title: 'My reading level', height: 'h-24' },
  { title: 'How fast Lumi flies', height: 'h-36' },
  { title: 'Did you understand the stories?', height: 'h-24' },
]

/** Light placeholders while the history loads. Never covers Start Reading. */
export function DashboardLoading() {
  return (
    <>
      <p className="text-base font-bold text-ink-muted" aria-live="polite">
        Getting your progress…
      </p>
      {SKELETONS.map((s) => (
        <section key={s.title} aria-hidden="true" className="flex flex-col gap-3.5 rounded-3xl border-2 border-[#f0dbd7] bg-card p-4.5">
          <span className="text-xl font-black text-[#b9a29e]">{s.title}</span>
          <div className={`grid grid-cols-4 items-end gap-2.5 motion-safe:animate-pulse ${s.height}`}>
            <span className="h-[55%] rounded-xl bg-[#f6e3df]" />
            <span className="h-[80%] rounded-xl bg-[#f6e3df]" />
            <span className="h-[65%] rounded-xl bg-[#f6e3df]" />
            <span className="h-[90%] rounded-xl bg-[#f6e3df]" />
          </div>
        </section>
      ))}
    </>
  )
}
