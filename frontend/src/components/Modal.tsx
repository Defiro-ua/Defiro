import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { useNativeDialog } from '../lib/useNativeDialog'

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<ModalSize, string> = {
  xs: 'max-w-dialog-xs',
  sm: 'max-w-dialog-sm',
  md: 'max-w-dialog-md',
  lg: 'max-w-dialog-lg',
  xl: 'max-w-dialog-xl',
}

type ModalProps = {
  open: boolean
  onClose: () => void
  /** id of the element that names the dialog */
  labelledBy: string
  describedBy?: string
  /** `alertdialog` for destructive confirmations */
  role?: 'dialog' | 'alertdialog'
  size?: ModalSize
  /**
   * `sheet`: large radius, hairline and orange-tinted shadow (CMD signing, reject);
   * `card`: plain card (confirmations inside a page).
   */
  look?: 'sheet' | 'card'
  className?: string
  children: ReactNode
}

/**
 * Modal built on the native <dialog>: focus is kept inside, Escape closes it
 * and the rest of the page is inert while it is open.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  role = 'dialog',
  size = 'md',
  look = 'card',
  className,
  children,
}: ModalProps) {
  const dialog = useNativeDialog(open, onClose)

  return (
    <dialog
      {...dialog}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cx(
        'm-auto w-dialog overflow-auto bg-bg p-6 text-ink sm:p-8',
        sizes[size],
        look === 'sheet' ? 'rounded-menu border border-line-strong shadow-menu' : 'rounded-lg shadow-modal',
        className,
      )}
    >
      {open && children}
    </dialog>
  )
}
