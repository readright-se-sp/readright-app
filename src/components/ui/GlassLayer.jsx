/**
 * Frosted-glass background for sticky bars: see-through white (each bar
 * passes its own `bg-white/…` — a navbar is more solid) + blur of whatever
 * scrolls underneath. It's its own layer behind the bar's content
 * because a backdrop filter on the bar itself would trap a `fixed` overlay
 * inside the bar (e.g. the dashboard's story-level picker).
 */
export function GlassLayer({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 border-white/70 backdrop-blur-lg backdrop-saturate-150 ${className}`}
    />
  )
}
