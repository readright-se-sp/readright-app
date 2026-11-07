import { useReadAloud } from '../../hooks/useReadAloud'
import { ComingSoon, PeachCard } from './DashboardParts'
import { LISTEN_BUTTON, LISTEN_PLAYING } from '../ui/stickerStyles'

// Faint ruled lines, like a page in a notebook, behind each word.
const RULED = 'bg-[repeating-linear-gradient(to_bottom,transparent_0_19px,#f6dccf_19px_20px)]'

/**
 * "My tricky words" — the words misread most often, each on a notebook-style
 * sticker with a "Hear it" button that says the word with the device voice
 * (useReadAloud). `words` is null until the backend provides miscue_details
 * (Coming soon), [] when there were none (praise), else [{ word, said?, times }].
 */
export function TrickyWordsCard({ words }) {
  const voice = useReadAloud('en-US')

  return (
    <PeachCard pill="Practice" title="My tricky words">
      {words === null && (
        <ComingSoon>Soon Lumi will show the words that were tricky for you, so you can practice them.</ComingSoon>
      )}

      {words?.length === 0 && (
        <div className="relative flex items-center gap-3 rounded-2xl border-[3px] border-level-tile-edge bg-[#fffaf3] p-4 shadow-level-tile">
          <span className="text-[30px] leading-none text-amber" aria-hidden="true">★</span>
          <p className="text-lg font-extrabold text-mint-ink">No tricky words yet, great job!</p>
        </div>
      )}

      {words?.length > 0 && (
        <ul className="relative flex flex-col gap-3.5">
          {words.map((t, i) => {
            const playing = voice.readingIdx === i
            const showSaid = t.said && t.said.toLowerCase() !== t.word.toLowerCase()
            return (
              <li
                key={t.word}
                className={`flex items-center gap-3 rounded-lg py-2.5 pl-3.5 pr-2.5 shadow-taped ${
                  playing ? 'bg-track-yellow' : `bg-[#fffaf3] ${RULED}`
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-2xl font-black leading-tight text-level-ink">{t.word}</span>
                    <span className="rounded-full bg-track-yellow px-2.5 py-px text-[13px] font-black text-level-ink">
                      {t.times === 1 ? '1 time' : `${t.times} times`}
                    </span>
                  </p>
                  {showSaid && <span className="text-[15px] font-bold text-coral-ink">You said “{t.said}”</span>}
                </div>
                {voice.supported && (
                  <button
                    type="button"
                    onClick={() => (playing ? voice.stop() : voice.play([{ idx: i, text: t.word }]))}
                    aria-label={playing ? `Stop: ${t.word}` : `Hear it: ${t.word}`}
                    className={`flex min-h-12 min-w-24 shrink-0 items-center justify-center gap-2 rounded-2xl px-3 text-base font-black ${
                      playing ? LISTEN_PLAYING : LISTEN_BUTTON
                    }`}
                  >
                    {playing ? <Equalizer /> : <SpeakerIcon />}
                    {playing ? 'Playing' : 'Hear it'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </PeachCard>
  )
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function Equalizer() {
  return (
    <span className="flex h-[18px] items-center gap-[3px]" aria-hidden="true">
      <span className="h-[18px] w-1 rounded-sm bg-white motion-safe:animate-eq" />
      <span className="h-[18px] w-1 rounded-sm bg-white motion-safe:animate-eq [animation-delay:0.2s]" />
      <span className="h-[18px] w-1 rounded-sm bg-white motion-safe:animate-eq [animation-delay:0.4s]" />
    </span>
  )
}
