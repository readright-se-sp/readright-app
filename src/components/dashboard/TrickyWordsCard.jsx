import { useReadAloud } from '../../hooks/useReadAloud'
import { ComingSoon, DashboardCard } from './DashboardParts'

/**
 * "My tricky words" — the words misread most often, each with a "Hear it"
 * button that says the word with the device voice (useReadAloud).
 * `words` is null until the backend provides miscue_details (Coming soon),
 * [] when there were none (praise), else [{ word, said?, times }].
 */
export function TrickyWordsCard({ words }) {
  const voice = useReadAloud('en-US')

  return (
    <DashboardCard title="My tricky words" className="gap-3">
      {words === null && (
        <ComingSoon>Soon Lumi will show the words that were tricky for you, so you can practice them.</ComingSoon>
      )}

      {words?.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-mint bg-mint-soft p-4.5">
          <span className="text-[30px] leading-none text-amber" aria-hidden="true">★</span>
          <p className="text-lg font-extrabold text-mint-ink">No tricky words yet, great job!</p>
        </div>
      )}

      {words?.length > 0 && (
        <ul className="flex flex-col gap-3">
          {words.map((t, i) => {
            const playing = voice.readingIdx === i
            const showSaid = t.said && t.said.toLowerCase() !== t.word.toLowerCase()
            return (
              <li
                key={t.word}
                className={`flex items-center gap-3 rounded-[18px] border-2 py-2.5 pl-4 pr-2.5 ${
                  playing ? 'border-brand bg-peach' : 'border-card-border bg-[#fff9f6]'
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-2xl font-black leading-tight">{t.word}</span>
                    <span className="text-base font-bold text-ink-muted">{t.times === 1 ? '1 time' : `${t.times} times`}</span>
                  </p>
                  {showSaid && <span className="text-base text-ink-soft">You said “{t.said}”</span>}
                </div>
                {voice.supported && (
                  <button
                    type="button"
                    onClick={() => (playing ? voice.stop() : voice.play([{ idx: i, text: t.word }]))}
                    aria-label={playing ? `Stop: ${t.word}` : `Hear it: ${t.word}`}
                    className={`flex min-h-12 min-w-24 shrink-0 items-center justify-center gap-2 rounded-[14px] border-2 px-3 text-base font-black shadow-[0_3px_0_#dfbfbc] active:translate-y-[3px] active:shadow-none ${
                      playing ? 'border-brand bg-brand text-white' : 'border-card-border bg-card text-brand'
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
    </DashboardCard>
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
