/**
 * useScrollLock
 *
 * Stops the page behind a dialog from scrolling while the calling component is
 * mounted (pass `active = false` to release it early). Locks both <html> and
 * <body> — mobile Safari ignores a lock on <body> alone — and restores their
 * previous overflow on cleanup, so nested or back-to-back dialogs don't leave
 * the page stuck.
 */
import { useEffect } from 'react'

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    const { documentElement: html, body } = document
    const previous = [html.style.overflow, body.style.overflow]
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous[0]
      body.style.overflow = previous[1]
    }
  }, [active])
}
