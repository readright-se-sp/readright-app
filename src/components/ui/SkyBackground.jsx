/**
 * SkyBackground — decorative blue sky with fluffy clouds, placed behind a
 * page's content. By default it fills the nearest positioned parent; `fixed`
 * pins it to the screen instead, for long pages that scroll over the sky
 * (the dashboard). Clouds drift gently only when the learner allows motion.
 * Hidden from screen readers.
 */

// Each cloud: size, position and how far it lags in the drift loop.
const CLOUDS = [
  'left-[-40px] top-[6%] w-44 opacity-90',
  'right-[-30px] top-[18%] w-56 opacity-80 [animation-delay:-3s]',
  'left-[8%] bottom-[22%] w-36 opacity-70 [animation-delay:-6s]',
  'right-[6%] bottom-[8%] w-48 opacity-90 [animation-delay:-2s]',
  'left-[38%] top-[-18px] w-32 opacity-60 [animation-delay:-8s]',
]

function Cloud({ className }) {
  return (
    <svg viewBox="0 0 200 100" className={`absolute h-auto motion-safe:animate-cloud-drift ${className}`}>
      <g fill="white">
        <circle cx="62" cy="62" r="30" />
        <circle cx="98" cy="46" r="38" />
        <circle cx="138" cy="62" r="28" />
        <rect x="40" y="58" width="122" height="34" rx="17" />
      </g>
    </svg>
  )
}

export function SkyBackground({ fixed = false }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden bg-linear-to-b from-sky-top to-sky-bottom`}>
      {CLOUDS.map((c) => (
        <Cloud key={c} className={c} />
      ))}
    </div>
  )
}
