import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { Icon } from '../components/Icon'
import { FeedbackContext } from './feedbackContext'

/** Shows the confirmation of small actions; it goes away by itself after 6 seconds */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; n: number; path: string } | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const show = useCallback((message: string) => setToast((t) => ({ message, n: (t?.n || 0) + 1, path: window.location.pathname })), [])
  // It belongs to the screen where it happened: moving to another screen drops it
  const visible = toast && toast.path === pathname ? toast : null

  return (
    <FeedbackContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite">
        {visible && (
          <p
            key={visible.n}
            className="fixed inset-x-0 top-4 z-[121] mx-auto flex w-max max-w-screen-gutter animate-toast items-center gap-3 rounded-lg border border-line-strong bg-panel py-2.5 pr-4.5 pl-3 text-[15px] leading-5.5 font-semibold text-ink shadow-toast"
          >
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-bg">
              <Icon name="check" size={16} />
            </span>
            {visible.message}
          </p>
        )}
      </div>
    </FeedbackContext.Provider>
  )
}
