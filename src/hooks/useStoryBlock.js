import { useEffect, useState } from 'react'

// A quick glance away shouldn't take the story from a child mid-sentence.
const BLOCK_AFTER_MS = 2000
// Waits for the face to stay in frame so the story doesn't flicker back and forth.
const RETURN_AFTER_MS = 1000

/**
 * Whether to cover the story because the learner has left the camera's frame.
 * A child reading can miss the small tip beside the camera, then lose the take
 * when the recording stops, but they can't miss the words disappearing. `cameraOut`
 * must hold steady for the whole wait: any flip starts it again.
 */
export function useStoryBlock(cameraOut) {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (cameraOut === blocked) return
    const t = setTimeout(() => setBlocked(cameraOut), cameraOut ? BLOCK_AFTER_MS : RETURN_AFTER_MS)
    return () => clearTimeout(t)
  }, [cameraOut, blocked])

  return blocked
}
