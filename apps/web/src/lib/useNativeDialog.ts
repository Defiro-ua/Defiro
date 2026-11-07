import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react'

/**
 * Wires a native <dialog> to an `open` flag: opens it as modal, closes it,
 * and routes Escape and backdrop clicks to `onClose`.
 */
export function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return {
    ref,
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault()
      onClose()
    },
    // A click on the backdrop lands on the <dialog> element itself
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
  }
}
