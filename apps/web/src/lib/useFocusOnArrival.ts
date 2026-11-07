import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router'

/**
 * After moving to a screen inside the app, the focus goes to its main
 * heading, so keyboard and screen reader users start reading there. Taking a
 * notice out of the history keeps the same screen, and the focus where it is.
 */
export function useFocusOnArrival(ref: RefObject<HTMLElement | null>, enabled = true) {
  const { pathname, key } = useLocation()
  const focusedFor = useRef<string | null>(null)
  useEffect(() => {
    if (focusedFor.current === pathname) return
    focusedFor.current = pathname
    if (enabled && key !== 'default') ref.current?.focus()
  }, [pathname, key, enabled, ref])
}
