import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useAudioClip — plays a short audio clip from a URL (e.g. the learner's own
 * recording of one word, once the backend provides clips). One clip at a time;
 * playback stops on unmount.
 *
 * @returns {{ playingUrl: string|null, play: (url: string) => void, stop: () => void }}
 */
export function useAudioClip() {
  const audioRef = useRef(null)
  const [playingUrl, setPlayingUrl] = useState(null)

  const stop = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingUrl(null)
  }, [])

  const play = useCallback(
    (url) => {
      stop()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPlayingUrl(null)
      audio.onerror = () => setPlayingUrl(null)
      setPlayingUrl(url)
      audio.play().catch(() => setPlayingUrl(null))
    },
    [stop],
  )

  useEffect(() => () => audioRef.current?.pause(), [])

  return { playingUrl, play, stop }
}
