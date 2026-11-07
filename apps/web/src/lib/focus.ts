/**
 * Moves the focus to an element once React has drawn the change that
 * brings it (a new step, a field that just appeared). A new step starts at
 * the top of the screen, like turning a page.
 */
export function focusSoon(id: string) {
  window.setTimeout(() => {
    const el = document.getElementById(id)
    if (!el) return
    if (id === 'passo-titulo') window.scrollTo(0, 0)
    el.focus()
  }, 0)
}
