import { useEffect, useRef, useState } from 'react'
import type { Profile } from '../../api/session'
import { cx } from '../../lib/cx'
import { Icon } from '../Icon'

/** «Sofia Almeida» → «SA»: the first letters of the first and last names */
function initials(name: string | null) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

type Props = {
  profile: Profile
  onSignOut: () => void
}

/** Account menu: for now only «Terminar sessão» */
function AccountMenu({ profile, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // While the menu is open: a click or the focus anywhere else closes it, so it does not
  // cover what has the focus; Escape closes it and gives the focus back to the account button
  useEffect(() => {
    if (!open) return
    const outside = (e: Event) => !rootRef.current?.contains(e.target as Node)
    const onPointerDown = (e: PointerEvent) => outside(e) && setOpen(false)
    const onFocusIn = (e: FocusEvent) => outside(e) && setOpen(false)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="painel-conta"
        className={cx(
          'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-pill border-0 py-0 pr-3.5 pl-1 text-left text-ink',
          open ? 'bg-soft' : 'bg-transparent hover:bg-soft-hover',
        )}
      >
        <span aria-hidden="true" className="grid size-9.5 place-items-center rounded-full bg-brand text-[13px] font-extrabold text-on-brand">
          {initials(profile.name)}
        </span>
        <span className="flex flex-col leading-[1.25]">
          <span className="text-[14px] font-semibold">{profile.name}</span>
          <span className="text-caption leading-[1.25] text-ink-3">{profile.jobTitle}</span>
        </span>
        <span className="sr-only">, menu da conta</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <section
          id="painel-conta"
          aria-label="Conta"
          className="absolute top-[calc(100%+14px)] -right-2 z-60 box-border flex w-90 max-w-[calc(100vw-32px)] flex-col gap-1 rounded-menu border border-line-strong bg-bg p-3 shadow-menu"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="flex min-h-11 items-center gap-2.5 rounded-item border-0 bg-transparent px-3 text-left text-[15px] text-ink-2 hover:bg-soft-hover"
          >
            <Icon name="logOut" size={18} /> Terminar sessão
          </button>
        </section>
      )}
    </div>
  )
}

/** Floating top bar: the person's unit and the account menu */
export function Topbar({ profile, onSignOut }: Props) {
  return (
    <div className="relative z-30 box-border w-full bg-bg px-4 py-2.5 text-ink sm:px-10">
      <header className="box-border flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 rounded-pill border-emph border-line-strong bg-bg py-1.5 pr-2 pl-4.5 shadow-island">
        <p className="m-0 flex-[1_1_200px] text-[14px] leading-5 text-ink-3">{profile.unit}</p>
        <AccountMenu profile={profile} onSignOut={onSignOut} />
      </header>
    </div>
  )
}
