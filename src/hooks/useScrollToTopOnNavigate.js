import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * useScrollToTopOnNavigate — starts each newly opened page at the top.
 *
 * A single-page app keeps the window's scroll position across route changes,
 * so tapping a link low on one page (e.g. the dashboard's "Past readings")
 * would open the next page part-way down. Back/Forward (POP) is left alone so
 * the browser can return the learner to where they were.
 *
 * Call once, inside the router (App).
 */
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])
}
