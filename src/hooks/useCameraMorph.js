import { useLayoutEffect, useRef } from 'react'

const DURATION_MS = 600
const EASING = 'cubic-bezier(0.45, 0, 0.15, 1)'

const size = (rect) => ({ width: `${rect.width}px`, height: `${rect.height}px` })

/**
 * Glides the camera between the large preview and the recording bubble on
 * /session, with the story box sliding along with it. The two states are
 * different layouts, so the screen switches at once and this animates each part
 * from where it just was to where it landed. Width and height animate instead of
 * a scale so the picture doesn't stretch on the way.
 *
 * Put `cameraRef` on the rounded box that clips the video and `storyRef` on the
 * story box. Skipped when the learner has asked for less motion.
 */
export function useCameraMorph(isRecording) {
  const cameraRef = useRef(null)
  const storyRef = useRef(null)
  const wasRecording = useRef(isRecording)
  const lastPlace = useRef(null)
  const animations = useRef([])

  // Runs after every render: the place measured last time is where the morph starts.
  useLayoutEffect(() => {
    const camera = cameraRef.current
    const story = storyRef.current
    if (!camera || !story) return

    const changed = wasRecording.current !== isRecording
    wasRecording.current = isRecording
    if (!changed && animations.current.length) return

    const box = camera.parentElement
    const from = lastPlace.current
    animations.current.forEach((a) => a.cancel())
    animations.current = []

    // The bubble's own size transition would otherwise start here and fight the morph.
    box.style.transition = 'none'
    const cameraRect = camera.getBoundingClientRect()
    const storyRect = story.getBoundingClientRect()
    lastPlace.current = { camera: cameraRect, story: storyRect }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!changed || !from || reduceMotion) {
      box.style.transition = ''
      return
    }

    const timing = { duration: DURATION_MS, easing: EASING }
    const cameraMorph = camera.animate(
      [
        {
          top: `${from.camera.top - cameraRect.top}px`,
          left: `${from.camera.left - cameraRect.left}px`,
          ...size(from.camera),
          borderRadius: isRecording ? '24px' : `${from.camera.width / 2}px`,
          zIndex: 20,
        },
        {
          top: '0px',
          left: '0px',
          ...size(cameraRect),
          borderRadius: isRecording ? `${cameraRect.width / 2}px` : '24px',
          zIndex: 20,
        },
      ],
      timing,
    )
    const storySlide = story.animate(
      [{ transform: `translateY(${from.story.top - storyRect.top}px)` }, { transform: 'none' }],
      timing,
    )
    animations.current = [cameraMorph, storySlide]
    cameraMorph.onfinish = () => {
      box.style.transition = ''
      animations.current = []
    }
  })

  return { cameraRef, storyRef }
}
