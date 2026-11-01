/**
 * Small building blocks shared by the dashboard cards.
 */

/** The standard dashboard card: soft fill, border and chunky bottom shadow. */
export function DashboardCard({ title, className = '', children, ...rest }) {
  return (
    <section
      className={`flex flex-col gap-3.5 rounded-3xl border-2 border-card-border bg-card p-4.5 shadow-card ${className}`}
      {...rest}
    >
      {title && <h2 className="text-[21px] font-black leading-tight">{title}</h2>}
      {children}
    </section>
  )
}

/** A simple face drawn in the current text colour: 'big' grin, 'smile' or 'flat'. */
export function Face({ mood, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" className="shrink-0">
      <circle cx="22" cy="22" r="20" fill="#fff9f6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="18" r="2.6" fill="currentColor" />
      <circle cx="28" cy="18" r="2.6" fill="currentColor" />
      {mood === 'big' && <path d="M13 25 Q22 35 31 25 Z" fill="currentColor" />}
      {mood === 'smile' && <path d="M15 26 Q22 32 29 26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />}
      {mood === 'flat' && <path d="M16 28 H28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />}
    </svg>
  )
}

/**
 * One column of a four-week row: a face tile with its label, the week name
 * under it. `face` is a LEVEL_FACES / COMPREHENSION_FACES entry, or null for a
 * week with no reading.
 */
export function WeekTile({ face, week }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex min-h-[124px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 px-1 py-3 text-center ${
          face ? `${face.card} ${face.border} ${face.ink}` : 'border-dashed border-[#b9a29e] text-ink-muted'
        }`}
      >
        {face && <Face mood={face.mood} />}
        {face?.stars && (
          <span className="text-[15px] tracking-[2px]" aria-hidden="true">
            {face.stars}
          </span>
        )}
        <span className="text-sm font-extrabold leading-tight">{face ? face.label : 'No reading'}</span>
      </div>
      <span className="text-center text-sm font-bold leading-tight text-ink-muted">{week}</span>
    </div>
  )
}

/** Dashed "Coming soon" box for sections still waiting on backend data. */
export function ComingSoon({ children }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-card-border px-4 py-5">
      <span className="rounded-full bg-lilac-soft px-3 py-1 text-sm font-black text-lilac-ink">Coming soon</span>
      <p className="text-[17px] leading-[1.4] text-ink-soft">{children}</p>
    </div>
  )
}
