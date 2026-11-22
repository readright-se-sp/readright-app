/**
 * Points of a five-pointed star centred on (cx, cy), for an SVG <polygon> —
 * the star eyes on the top level's face (results, dashboard, past readings).
 * `outer` / `inner` are the tip and dip radii in the SVG's own units.
 */
export function starPoints(cx, cy, outer = 6.6, inner = 3.1) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}
