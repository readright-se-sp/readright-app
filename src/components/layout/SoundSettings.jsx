import { useId } from 'react'
import { useTapSoundVolume } from '../../hooks/useTapSound'
import { GridPattern } from '../dashboard/DashboardParts'

// Learner-facing word for the volume, so the setting reads in plain words and
// not just as a slider position.
function volumeWord(volume) {
  if (volume === 0) return 'Off'
  if (volume < 0.34) return 'Soft'
  if (volume < 0.67) return 'Medium'
  return 'Loud'
}

// Arrow/Home/End/Page keys move the slider — preview the sound when they're released.
const SLIDER_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// Chunky slider: red fill up to the thumb (--fill, set from the value), cream
// after it, and a white thumb with a red ring + ledge. The input itself stays
// 44px tall for the touch target; only the track and thumb are drawn smaller.
const SLIDER = [
  'h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent',
  // Chrome, Safari, Edge
  '[&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-full',
  '[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-level-pill)_var(--fill),var(--color-cream-button)_var(--fill))]',
  '[&::-webkit-slider-runnable-track]:shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]',
  '[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-level-pill',
  '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_3px_0_var(--color-brand)]',
  // Firefox
  '[&::-moz-range-track]:h-4 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-cream-button',
  '[&::-moz-range-progress]:h-4 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-level-pill',
  '[&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4',
  '[&::-moz-range-thumb]:border-level-pill [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_3px_0_var(--color-brand)]',
].join(' ')

/**
 * SoundSettings — the yellow "Sounds" card inside ProfileMenu (button taps + the results cheer).
 * Speaker button turns the sounds off/on; the slider sets how loud they are,
 * with the level in words (Off / Soft / Medium / Loud) in the pill. The sound
 * plays once after a change so the learner hears the new volume.
 */
export function SoundSettings() {
  const { volume, setVolume, toggleOff, preview } = useTapSoundVolume()
  const labelId = useId()
  const off = volume === 0
  const word = volumeWord(volume)
  const pct = Math.round(volume * 100)

  function handleToggle() {
    toggleOff()
    preview() // silent when turning off, plays at the restored volume when turning on
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="relative isolate overflow-clip rounded-[20px] bg-track-yellow px-4 pb-1.5 pt-3.5 shadow-track-yellow"
    >
      <GridPattern cell={20} color="white" opacity={0.35} className="-z-10" />

      <div className="flex items-center justify-between gap-2">
        <p id={labelId} className="text-lg font-black text-result-olive">
          Sounds
        </p>
        <span className="rounded-full bg-cream-button px-3.5 py-0.5 text-[15px] font-black text-coral-ink shadow-cream-button">
          {word}
        </span>
      </div>

      <div className="-ml-2.5 mt-1 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggle}
          // The global tap sound would play at the old volume; preview() plays the new one.
          data-no-tap-sound
          aria-label={off ? 'Turn sounds on' : 'Turn sounds off'}
          className="flex min-h-[44px] min-w-[44px] flex-none items-center justify-center rounded-full text-result-olive active:bg-black/5"
        >
          <SpeakerIcon off={off} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={pct}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          onPointerUp={preview}
          onKeyUp={(e) => SLIDER_KEYS.includes(e.key) && preview()}
          aria-label="Sound volume"
          aria-valuetext={word}
          // How far the red fill reaches — changes with the value, so it can't be a class.
          style={{ '--fill': `${pct}%` }}
          className={SLIDER}
        />
      </div>
    </div>
  )
}

function SpeakerIcon({ off }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
      {off ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <path d="M15.5 9a4 4 0 0 1 0 6" />
      )}
    </svg>
  )
}
