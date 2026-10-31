import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useReadAloud — reads quiz text out loud with the browser's speech synthesis
 * (Web Speech API), so learners who struggle to read the question can listen.
 *
 * `play(parts)` speaks each part in order; parts are `{ idx, text }` and
 * `readingIdx` reports the `idx` of the part being spoken (null when idle), so
 * the UI can highlight the option being read. `stop()` cancels.
 *
 * Speech is cancelled on unmount. A run counter ignores events from a cancelled
 * run (browsers fire onend/onerror for utterances dropped by cancel()).
 *
 * @param {string} lang — BCP-47 voice language, e.g. 'en-US' or 'fil-PH'
 * @returns {{ supported: boolean, playing: boolean, readingIdx: number|null,
 *             play: (parts: {idx: number, text: string}[]) => void, stop: () => void }}
 */
export function useReadAloud(lang = 'en-US') {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [readingIdx, setReadingIdx] = useState(null)
  const runRef = useRef(0)

  const stop = useCallback(() => {
    runRef.current += 1
    if (supported) window.speechSynthesis.cancel()
    setReadingIdx(null)
  }, [supported])

  const play = useCallback(
    (parts) => {
      if (!supported || parts.length === 0) return
      runRef.current += 1
      const run = runRef.current
      window.speechSynthesis.cancel()

      parts.forEach((part, i) => {
        const utterance = new SpeechSynthesisUtterance(part.text)
        utterance.lang = lang
        utterance.rate = 0.9 // a little slower for young listeners
        utterance.onstart = () => {
          if (runRef.current === run) setReadingIdx(part.idx)
        }
        utterance.onend = () => {
          if (runRef.current === run && i === parts.length - 1) setReadingIdx(null)
        }
        utterance.onerror = () => {
          if (runRef.current === run) setReadingIdx(null)
        }
        window.speechSynthesis.speak(utterance)
      })
      setReadingIdx(parts[0].idx)
    },
    [lang, supported],
  )

  useEffect(
    () => () => {
      runRef.current += 1
      if (supported) window.speechSynthesis.cancel()
    },
    [supported],
  )

  return { supported, playing: readingIdx !== null, readingIdx, play, stop }
}
