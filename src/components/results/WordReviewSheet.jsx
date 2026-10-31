import { useState } from 'react'
import { useReadAloud } from '../../hooks/useReadAloud'
import { useAudioClip } from '../../hooks/useAudioClip'

/**
 * Bottom sheet that walks through the tricky words of one miscue type:
 * what the learner said → how it should sound, with the sentence from the story.
 *
 * "Hear it the right way" uses the device voice (useReadAloud). "Hear your
 * voice" plays the word's `said_audio_url` clip of the learner's own reading;
 * until the backend provides clips it shows as a disabled "Coming soon" placeholder.
 * Esc or tapping outside closes it.
 */
export function WordReviewSheet({ type, words, onClose }) {
  const [idx, setIdx] = useState(0)
  const word = words[idx]
  const last = idx === words.length - 1
  const voice = useReadAloud('en-US')
  const clip = useAudioClip()

  function stopAll() {
    voice.stop()
    clip.stop()
  }

  function close() {
    stopAll()
    onClose()
  }

  function goTo(i) {
    stopAll()
    setIdx(i)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(60,20,15,0.45)]"
      onClick={close}
      onKeyDown={(e) => e.key === 'Escape' && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={type.name}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[28px] bg-[#fff9f6] px-4.5 pb-5.5 pt-2.5 font-display text-ink"
      >
        <span className="mb-2.5 h-[5px] w-12 self-center rounded-full bg-[#e3c3bb]" aria-hidden="true" />
        <div className="flex items-center justify-between gap-2.5">
          <span className={`rounded-full px-3.5 py-1.5 text-sm font-black ${type.card} ${type.ink}`}>{type.name}</span>
          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-[#ebcfc8] bg-white text-[22px] font-extrabold text-ink-soft"
          >
            ×
          </button>
        </div>

        {words.length > 1 && (
          <div className="mb-3.5 mt-4 flex justify-center gap-2" aria-label={`Word ${idx + 1} of ${words.length}`}>
            {words.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all duration-200 ${i === idx ? `w-6.5 ${type.dot}` : 'w-2.5 bg-[#e3c3bb]'}`}
              />
            ))}
          </div>
        )}

        {/* What the learner said */}
        <div className={`mt-3 flex flex-col gap-2.5 rounded-[22px] border-2 bg-white p-4 ${type.border}`}>
          <span className={`text-sm font-black uppercase tracking-[0.05em] ${type.ink}`}>{type.said}</span>
          <span className="text-[30px] font-black leading-[1.1]">“{word.said}”</span>
          {word.said_audio_url ? (
            <PlayButton
              className={type.dot}
              playing={clip.playingUrl === word.said_audio_url}
              label="Hear your voice"
              onClick={() => {
                voice.stop()
                clip.play(word.said_audio_url)
              }}
            />
          ) : (
            // TODO(learner audio): placeholder until the backend provides
            // said_audio_url clips of the learner's own reading.
            <button
              type="button"
              disabled
              className="flex h-13 cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#e3c3bb] bg-[#f7f4f3] text-base font-black text-ink-muted"
            >
              <span
                aria-hidden="true"
                className="size-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-ink-muted"
              />
              Hear your voice · Coming soon
            </button>
          )}
        </div>

        <div className="my-1 text-center text-2xl font-black leading-none text-[#c9a9a2]" aria-hidden="true">↓</div>

        {/* How it should sound */}
        <div className="flex flex-col gap-2.5 rounded-[22px] border-2 border-[#9fd0af] bg-mint-soft p-4">
          <span className="text-sm font-black uppercase tracking-[0.05em] text-mint-ink">{type.fix}</span>
          <p className="flex flex-wrap items-baseline gap-2.5">
            <span className="text-[30px] font-black leading-[1.1] text-[#173823]">“{word.expected}”</span>
            {word.pronunciation && <span className="text-[17px] font-bold text-mint-ink">{word.pronunciation}</span>}
          </p>
          {voice.supported && (
            <PlayButton
              className="bg-mint-ink"
              playing={voice.playing}
              label="Hear it the right way"
              onClick={() => {
                clip.stop()
                voice.play([{ idx: 0, text: word.expected }])
              }}
            />
          )}
        </div>

        {word.sentence && (
          <p className="mt-3.5 rounded-2xl bg-peach px-3.5 py-3 text-base font-semibold leading-[1.4] text-ink-soft">
            <span className="mb-0.5 block text-xs font-black uppercase tracking-[0.05em] text-[#8a6410]">In the story</span>
            <Highlighted sentence={word.sentence} word={word.expected} />
          </p>
        )}

        <div className="mt-auto flex gap-2.5 pt-4">
          <button
            type="button"
            onClick={() => goTo(idx - 1)}
            disabled={idx === 0}
            className="h-14 flex-1 rounded-[18px] border-2 border-[#ebcfc8] bg-white text-[17px] font-black text-ink-soft disabled:opacity-40"
          >
            ‹ Back
          </button>
          <button
            type="button"
            onClick={() => (last ? close() : goTo(idx + 1))}
            className="h-14 flex-[2] rounded-[18px] bg-brand text-[17px] font-black text-white shadow-[0_4px_0_#7a1f1b] active:translate-y-1 active:shadow-[0_1px_0_#7a1f1b]"
          >
            {last ? 'All done!' : 'Next word ›'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayButton({ className, playing, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-13 items-center justify-center gap-2.5 rounded-2xl text-base font-black text-white ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-white"
      />
      {playing ? 'Playing…' : label}
    </button>
  )
}

// Highlights the first case-insensitive match of `word` inside `sentence`.
function Highlighted({ sentence, word }) {
  const at = word ? sentence.toLowerCase().indexOf(word.toLowerCase()) : -1
  if (at === -1) return sentence
  return (
    <>
      {sentence.slice(0, at)}
      <mark className="rounded-md bg-[#f6c14b] px-1 font-black text-ink">{sentence.slice(at, at + word.length)}</mark>
      {sentence.slice(at + word.length)}
    </>
  )
}
