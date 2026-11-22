/**
 * Avatar — learner initial circle.
 * size 'sm' (40px header, Lumi's red; 20px extra-bold letter so white on that red stays readable) | 'lg' (96px profile, soft fill).
 * For 'lg', pass an optional `badge` node (e.g. the "LVL 4" pill) rendered
 * over the bottom-right corner.
 */
export default function Avatar({ initial, size = 'sm', badge = null }) {
  if (size === 'lg') {
    return (
      <div className="relative">
        <div className="size-[96px] rounded-full bg-soft border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
          <span className="text-brand text-[36px] font-extrabold">{initial}</span>
        </div>
        {badge}
      </div>
    )
  }

  return (
    <div className="size-[40px] rounded-full bg-lumi border-2 border-white flex items-center justify-center shadow-sm">
      <span className="text-white text-[20px] font-black">{initial}</span>
    </div>
  )
}
