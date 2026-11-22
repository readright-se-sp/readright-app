// useExitNavigate.js — navigate after a short exit animation.
//
// const { leaving, leaveTo } = useExitNavigate(EXIT_MS)
//   leaveTo(to, options) — same arguments as React Router's navigate(). Sets
//     `leaving` (so the page can switch its cards to their exit animation),
//     then navigates once `exitMs` has passed. With reduced motion it
//     navigates straight away. Further calls while leaving are ignored, so a
//     double tap can't navigate twice.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useExitNavigate(exitMs) {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(null)

  // Cancel a pending navigation if the page unmounts first.
  useEffect(() => () => clearTimeout(timer.current), [])

  const leaveTo = useCallback(
    (to, options) => {
      if (timer.current) return // already on the way out
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) {
        navigate(to, options)
        return
      }
      setLeaving(true)
      timer.current = setTimeout(() => navigate(to, options), exitMs)
    },
    [navigate, exitMs],
  )

  return { leaving, leaveTo }
}
