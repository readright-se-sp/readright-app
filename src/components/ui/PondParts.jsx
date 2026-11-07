// Pond decorations shared by the dashboard's "Past readings" card and the
// /history pond background. Decorative only; each is absolutely positioned
// by the caller (`className` sets spot, size and turn).

// The lotus bud's petal pink.
const LOTUS_PINK = '#f38aa7'

/** A round lily pad with a notch and soft veins. */
export function LilyPad({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={`pointer-events-none absolute ${className}`}>
      <path d="M50 50 L17.9 85.7 A48 48 0 1 1 27.5 92.4Z" className="fill-lily" />
      <path
        d="M50 50 90 50M50 50 78.3 21.7M50 50 50 10M50 50 21.7 21.7M50 50 10 50M50 50 78.3 78.3M50 50 50 90"
        className="stroke-lily-vein"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A pink lotus bud floating on a ripple. */
export function LotusBud({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 24" className={`pointer-events-none absolute ${className}`}>
      <ellipse cx="20" cy="19.5" rx="18" ry="3.8" fill="rgb(255 255 255 / 0.35)" stroke="#fff" strokeWidth="2" />
      <ellipse cx="20" cy="19.5" rx="11" ry="2.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M20 18C12 18 8 12 9 8 14 9 18 13 20 18Z" fill={LOTUS_PINK} />
      <path d="M20 18C28 18 32 12 31 8 26 9 22 13 20 18Z" fill={LOTUS_PINK} />
      <path d="M20 4C26 8 26 15 20 18 14 15 14 8 20 4Z" fill="#f9b3c6" />
    </svg>
  )
}

/** Two soft white rings on the water. */
export function Ripple({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 20" className={`pointer-events-none absolute ${className}`}>
      <ellipse cx="30" cy="10" rx="28" ry="8" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.8" />
      <ellipse cx="30" cy="10" rx="16" ry="4.5" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" />
    </svg>
  )
}
