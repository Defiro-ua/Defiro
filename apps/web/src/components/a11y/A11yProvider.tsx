import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { a11yTokens, defaultA11y, describeElement, loadA11y, saveA11y, speak, stopSpeaking, type A11ySettings } from '../../lib/a11y'
import { A11yContext } from '../../lib/a11yContext'

/** Elements whose text is read when clicked with "Ler em voz alta" on */
const READABLE = 'button, a, label, h1, h2, h3, h4, p, li, td, th, dt, dd, legend, input, select, textarea'

/**
 * Keeps the accessibility settings, saves them in this browser and applies them:
 * data attributes on <html> (read by index.css), zoom for larger text and the
 * read-aloud listeners.
 */
export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(loadA11y)

  useEffect(() => {
    saveA11y(settings)
    const html = document.documentElement
    const tokens = a11yTokens(settings)
    if (tokens) html.dataset.a11y = tokens
    else delete html.dataset.a11y
    if (settings.cor !== 'padrao') html.dataset.cor = settings.cor
    else delete html.dataset.cor
    if (settings.tema === 'cma') html.dataset.tema = 'cma'
    else delete html.dataset.tema
  }, [settings])

  // Read aloud: a click reads the text clicked; moving with the keyboard reads what gets the focus
  useEffect(() => {
    if (!settings.voz) {
      stopSpeaking()
      return
    }
    let keyboard = false
    const onKey = () => {
      keyboard = true
    }
    const onPointer = () => {
      keyboard = false
    }
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest(READABLE)
      if (!target || target.closest('[data-a11y-menu]')) return
      const text = /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)
        ? describeElement(target)
        : target.getAttribute('aria-label') || (target as HTMLElement).innerText
      speak(String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 400))
    }
    const onFocus = (event: FocusEvent) => {
      if (keyboard && event.target instanceof Element) speak(describeElement(event.target))
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('focusin', onFocus, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('focusin', onFocus, true)
    }
  }, [settings.voz])

  const value = useMemo(
    () => ({
      settings,
      update: (patch: Partial<A11ySettings>) => setSettings((current) => ({ ...current, ...patch })),
      // «Repor» puts the accessibility settings back and keeps the theme
      reset: () => setSettings((current) => ({ ...defaultA11y, tema: current.tema })),
    }),
    [settings],
  )

  const zoom = Number(settings.texto)
  return (
    <A11yContext.Provider value={value}>
      {/* Larger text zooms the whole page, as in the mockup, so layouts stay proportional */}
      <div style={zoom === 1 ? undefined : { zoom }}>{children}</div>
    </A11yContext.Provider>
  )
}
