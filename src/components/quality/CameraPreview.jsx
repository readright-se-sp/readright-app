import { useEffect, useRef } from 'react'

/** The blinking "Live" badge for the corner of a camera box. */
export function LiveBadge() {
  return (
    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-0.5 text-sm font-black text-white">
      <span aria-hidden="true" className="size-2 rounded-full bg-coral motion-safe:animate-blink" />
      Live
    </span>
  )
}

/**
 * CameraPreview — live, self-view (mirrored) camera feed for GO1.
 *
 * Pure consumer of the stream owned by useMediaStream: it attaches the stream
 * to a <video> for display only and never stops tracks.
 *
 * iOS Safari notes:
 *   - `playsInline` is required or Safari forces fullscreen playback.
 *   - `muted` is required for autoplay (and prevents echo from the live mic).
 *   - `srcObject` must be set imperatively — React can't set it via a prop.
 *   - play() must be called explicitly after setting srcObject.
 *
 * `onVideoNode` (optional) reports the <video> DOM node to a parent so it can run
 * GO1 checks against the same element (e.g. real-time monitoring on /session). A
 * callback ref — not forwardRef — because the parent needs the node as reactive
 * state to drive its check hooks. Memoize it in the parent or the ref will thrash.
 *
 * `className` (optional) overrides the default 4:3 card styling, e.g. to fill a
 * container that resizes into the recording bubble on /session.
 *
 * `onVideoRatio` (optional) reports the camera's width ÷ height, so a parent can
 * size its box to match instead of cropping the picture.
 */
export function CameraPreview({
  stream,
  onVideoNode,
  onVideoRatio,
  className = 'w-full aspect-[4/3] rounded-[12px] object-cover -scale-x-100 bg-ink',
}) {
  const videoRef = useRef(null)

  // Merge the internal ref (used to own srcObject/play) with the optional report.
  const setRef = (node) => {
    videoRef.current = node
    onVideoNode?.(node)
  }

  const reportRatio = ({ target: { videoWidth, videoHeight } }) => {
    if (videoWidth && videoHeight) onVideoRatio?.(videoWidth / videoHeight)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) return

    video.srcObject = stream
    const playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      // Autoplay can be interrupted (e.g. a fast unmount). muted + playsInline
      // normally prevent a policy block, so just swallow the AbortError.
      playPromise.catch(() => {})
    }

    return () => {
      // Detach so the element releases its track references. Stopping the
      // tracks is useMediaStream's job, never ours.
      video.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={setRef}
      autoPlay
      muted
      playsInline
      aria-label="Camera preview"
      onLoadedMetadata={reportRatio}
      onResize={reportRatio}
      className={className}
    />
  )
}
