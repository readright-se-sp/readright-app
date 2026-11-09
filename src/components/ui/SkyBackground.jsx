/**
 * SkyBackground — decorative blue sky with fluffy clouds, placed behind a
 * page's content. By default it fills the nearest positioned parent; `fixed`
 * pins it to the screen instead, for long pages that scroll over the sky
 * (the dashboard). `forest` adds a line of trees along the bottom. Clouds
 * drift gently only when the learner allows motion. Hidden from screen readers.
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

// Forest, far to near: round treetops (x, y, radius), then pines (x, scale).
const TREETOPS = [[20, 125, 22], [60, 115, 26], [105, 128, 20], [150, 118, 25], [200, 128, 21], [245, 116, 26], [295, 128, 20], [340, 118, 25], [385, 126, 22]]
const PINES = [[30, 1], [95, 1.2], [170, 0.9], [235, 1.15], [310, 0.95], [375, 1.2]]

// The 400-wide stretch of forest repeats across the screen, a layer at a time
// so a pine leaning over the seam stays in front of the next stretch's trees.
const STRETCHES = [0, 400, 800, 1200]

function repeated(shape) {
  return STRETCHES.map((x) => <g key={x} transform={`translate(${x})`}>{shape}</g>)
}

/** Soft hills and trees with no outlines, pinned to the bottom; the same size on phones and laptops. */
function Forest() {
  return (
    <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[200px] w-full">
      <g className="fill-forest-far">{repeated(<path d="M0 120Q60 85 130 110T260 100T400 120V200H0Z" />)}</g>
      <g className="fill-forest-mid">
        {repeated(TREETOPS.map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />))}
        <rect y="118" width="1600" height="82" />
      </g>
      {/* Stroked in their own colour only to round the corners. */}
      <g className="fill-forest-near stroke-forest-near" strokeWidth="4" strokeLinejoin="round">
        {repeated(PINES.map(([x, scale]) => (
          <path key={x} transform={`translate(${x} 165) scale(${scale})`} d="M0-72 18-46H9L24-24H12L30 0H-30L-12-24H-24L-9-46H-18Z" />
        )))}
      </g>
      <g className="fill-forest-ground">{repeated(<path d="M0 160Q100 148 200 160T400 160V200H0Z" />)}</g>
    </svg>
  )
}

export function SkyBackground({ fixed = false, forest = false }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden bg-linear-to-b from-sky-top to-sky-bottom`}>
      {CLOUDS.map((c) => (
        <Cloud key={c} className={c} />
      ))}
      {forest && <Forest />}
    </div>
  )
}
