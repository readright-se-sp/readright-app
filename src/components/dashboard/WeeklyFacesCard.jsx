import { useState } from 'react'
import { PeachCard, Star } from './DashboardParts'

const OUTLINE = '#7a3b2e'

/**
 * A face that looks the same for a level in every week: 'smile' / 'flat' are
 * filled with the level colour; 'big' (the top level) is always the cheery
 * cream face with happy closed eyes and pink cheeks. `large` for this week.
 */
function WeekFace({ mood, fill, large }) {
  const cheery = mood === 'big'
  const eyes = cheery
    ? <path d="M12.5 19.5Q15.5 15 18.5 19.5M25.5 19.5Q28.5 15 31.5 19.5" fill="none" stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round" />
    : <><circle cx="16" cy="18" r="2.6" fill={OUTLINE} /><circle cx="28" cy="18" r="2.6" fill={OUTLINE} /></>
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className={large ? 'size-14 shrink-0' : 'size-11 shrink-0'}>
      {/* No outline, to match Lumi's soft look; a soft shadow keeps the face clear of its tile. */}
      <circle cx="22" cy="23.5" r="20" fill="rgb(138 68 54 / 0.16)" />
      <circle cx="22" cy="22" r="20" fill={cheery ? '#fff7ee' : fill} />
      {eyes}
      {mood === 'big' && <path d="M13 25Q22 35 31 25Z" fill={OUTLINE} />}
      {mood === 'smile' && <path d="M15 26Q22 32 29 26" fill="none" stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round" />}
      {mood === 'flat' && <path d="M16 28H28" fill="none" stroke={OUTLINE} strokeWidth="2.6" strokeLinecap="round" />}
      {cheery && <><ellipse cx="10.5" cy="26.5" rx="3" ry="2" fill="#ff9fb0" /><ellipse cx="33.5" cy="26.5" rx="3" ry="2" fill="#ff9fb0" /></>}
    </svg>
  )
}

// Washi tape: each week gets its own colour, pattern and angle, as if stuck on
// by hand. This week (last) is pink, which no level colour clashes with.
const DOTS = 'bg-[radial-gradient(circle,rgb(255_255_255/0.75)_1.4px,transparent_1.6px)] bg-size-[7px_7px]'
const STRIPES = 'bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.5)_0_3px,transparent_3px_7px)]'
const TAPES = [
  `bg-tape-mint ${DOTS} -rotate-4`,
  `bg-tape-blue ${STRIPES} rotate-3`,
  `bg-tape-yellow ${DOTS} -rotate-2`,
  `bg-tape-pink ${STRIPES} rotate-4`,
]
// Torn ends on the short sides.
const TORN = '[clip-path:polygon(3%_0,97%_0,100%_20%,96%_40%,100%_60%,96%_80%,98%_100%,2%_100%,0_80%,4%_60%,0_40%,4%_20%)]'

/**
 * One week: a face tile with its label, the week name under it. `face` is a
 * LEVEL_FACES / COMPREHENSION_FACES entry, or null for a week with no reading.
 * A week with a reading is a paper tile taped onto the card (no outline); an
 * empty week is a dashed gap with nothing taped there.
 * `current` (this week) gets the strong colour, a tilt, sparkles and a pill.
 */
function WeekTile({ face, week, current, index }) {
  const look = face
    ? `shadow-taped ${current ? `${face.strong} ${face.strongInk}` : `${face.tile} ${face.ink}`}`
    : 'border-[3px] border-dashed border-level-edge bg-[#fff6ef] text-level-muted'
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className={`relative flex min-h-[124px] w-full flex-col items-center justify-center gap-2 rounded-lg px-1 py-3 text-center ${look} ${current ? 'rotate-2 @[28rem]:min-h-[164px]' : ''}`}>
        {face && (
          <span
            aria-hidden="true"
            className={`absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 ${TORN} ${TAPES[index % TAPES.length]}`}
          />
        )}
        {current && face && (
          <>
            <Star className="-right-3 -top-4 size-9 text-cta drop-shadow-[0_2px_0_rgba(138,68,54,0.35)]" />
            <Star className="left-2 top-2 size-4 text-white" />
          </>
        )}
        {face
          ? <WeekFace mood={face.mood} fill={face.faceFill} large={current} />
          : <span aria-hidden="true" className="size-11 rounded-full border-[3px] border-dashed border-level-edge" />}
        <span className={`font-extrabold leading-tight ${current && face ? 'text-[17px] font-black' : 'text-sm'}`}>
          {face ? face.label : 'No reading'}
        </span>
      </div>
      {current
        ? <span className="rounded-full bg-level-pill px-3 py-0.5 text-sm font-black text-white">{week}</span>
        : <span className="text-center text-sm font-bold leading-tight text-level-muted">{week}</span>}
    </div>
  )
}

/**
 * Two-option switch above the card title (e.g. Reading | Understanding):
 * the chosen one is yellow like the /history grade chips, announced with
 * aria-pressed. Each option is at least 44px tall.
 */
function ViewToggle({ views, active, onChange }) {
  return (
    <div className="relative flex gap-2.5" role="group" aria-label="Choose what to show">
      {views.map((v, i) => {
        const on = i === active
        return (
          <button
            key={v.tab}
            type="button"
            onClick={() => onChange(i)}
            aria-pressed={on}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-full border-[3px] px-3 text-base font-black text-level-ink active:translate-y-0.5 active:shadow-none ${
              on
                ? 'border-track-yellow-edge bg-track-yellow shadow-[0_3px_0_var(--color-track-yellow-edge)]'
                : 'border-cream-edge bg-cream-button shadow-cream-button'
            }`}
          >
            {v.tab}
          </button>
        )
      })}
    </div>
  )
}

/**
 * "Last 4 weeks" — one card with a switch (above the title) between views
 * that share the same face-tile layout: "My reading level" (Reading, shown
 * first) and "My understanding level" (Understanding). The title follows the
 * switch.
 *
 * `views` = [{ tab, title, weeks, empty }]: `weeks` = [{ label, face }]
 * (oldest first), face null for a week with no reading, the last week being
 * this week; `empty` (e.g. a Coming soon box) replaces the tiles when set.
 *
 * Tiles are 2×2 on phones; one row of four (this week bigger) only once the
 * card is ≥ 28rem wide (a container query on the card, not the screen), so
 * labels like "Instructional" always fit inside their tile.
 */
export function WeeklyFacesCard({ views }) {
  const [active, setActive] = useState(0)
  const view = views[active]

  return (
    <PeachCard pill="Last 4 weeks" title={view.title} top={<ViewToggle views={views} active={active} onChange={setActive} />}>
      {view.empty || (
        <ul className="relative grid grid-cols-2 gap-x-3 gap-y-4 pt-3 @[28rem]:grid-cols-[1fr_1fr_1fr_1.25fr] @[28rem]:items-end @[28rem]:gap-x-2.5">
          {view.weeks.map((w, i) => (
            <li key={w.label} className="min-w-0">
              <WeekTile face={w.face} week={w.label} current={i === view.weeks.length - 1} index={i} />
            </li>
          ))}
        </ul>
      )}
    </PeachCard>
  )
}
