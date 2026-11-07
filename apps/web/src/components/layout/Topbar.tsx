import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { personaIds, personas } from '../../domain/people'
import type { Persona } from '../../domain/types'
import { themes } from '../../lib/a11y'
import { useA11y } from '../../lib/a11yContext'
import { cx } from '../../lib/cx'
import { useDemo } from '../../state/demoContext'
import { Icon } from '../Icon'

const rowBase = 'flex w-full items-center gap-3 rounded-item border-0 px-3 py-1.5 text-left font-sans text-ink'

/** Account menu: «Ver como» (demo only), the brand theme, start the demo again, sign out */
function AccountMenu({ me }: { me: Persona }) {
  const { entrar, repor, sair } = useDemo()
  const { settings, update } = useA11y()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // A click anywhere else closes the menu
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  function close() {
    setOpen(false)
    buttonRef.current?.focus()
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      close()
    }
  }
  // Tabbing out of the open menu closes it, so it does not cover the focus
  function onBlur(e: FocusEvent) {
    const next = e.relatedTarget as Node | null
    if (open && next && !rootRef.current?.contains(next)) setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="painel-conta"
        className={cx('flex min-h-12 cursor-pointer items-center gap-2.5 rounded-pill border-0 py-0 pr-3.5 pl-1 text-left text-ink', open ? 'bg-soft' : 'bg-transparent hover:bg-soft-hover')}
      >
        <span aria-hidden="true" className="grid size-9.5 place-items-center rounded-full bg-brand text-[13px] font-extrabold text-on-brand">
          {me.ini}
        </span>
        <span className="flex flex-col leading-[1.25]">
          <span className="text-[14px] font-semibold">{me.nome}</span>
          <span className="text-caption leading-[1.25] text-ink-3">{me.papel}</span>
        </span>
        <span className="sr-only">, menu da conta</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div
          id="painel-conta"
          role="region"
          aria-label="Conta"
          className="absolute top-[calc(100%+14px)] -right-2 z-60 box-border flex w-90 max-w-[calc(100vw-32px)] flex-col gap-1 rounded-menu border border-line-strong bg-bg p-3 shadow-menu"
        >
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2">
            <h2 id="ver-como" className="m-0 text-[14px] leading-5 font-semibold text-ink-2">
              Ver como
            </h2>
            <span className="edge rounded-sm bg-warning-soft px-2.5 py-0.5 text-caption font-semibold text-warning">Só na demonstração</span>
          </div>
          <ul aria-labelledby="ver-como" className="m-0 flex list-none flex-col gap-0.5 p-0">
            {personaIds.map((id) => {
              const p = personas[id]
              const on = id === me.id
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={on ? 'true' : undefined}
                    onClick={() => {
                      setOpen(false)
                      entrar(id)
                    }}
                    className={cx(rowBase, 'min-h-13', on ? 'edge bg-soft' : 'bg-transparent hover:bg-soft-hover')}
                  >
                    <span className="flex flex-1 flex-col leading-[1.3]">
                      <span className="text-[15px] font-semibold text-ink">{p.nome}</span>
                      <span className="text-label-sm leading-[1.3] text-ink-3">
                        {p.papel} · {p.funcao}
                      </span>
                    </span>
                    {on && (
                      <span className="inline-flex items-center gap-1 text-label-sm font-semibold text-ink">
                        <Icon name="check" size={18} /> Atual
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <span aria-hidden="true" className="mx-3 my-1.5 h-px bg-line" />
          <h2 id="tema" className="m-0 px-3 py-2 text-[14px] leading-5 font-semibold text-ink-2">
            Tema
          </h2>
          <ul aria-labelledby="tema" className="m-0 flex list-none flex-col gap-0.5 p-0">
            {themes.map((t) => {
              const on = settings.tema === t.id
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ tema: t.id })}
                    className={cx(rowBase, 'box-border min-h-14', on ? 'bg-soft shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]' : 'bg-transparent hover:bg-soft-hover')}
                  >
                    <span aria-hidden="true" className="inline-flex shrink-0">
                      <span className="size-4.5 rounded-full shadow-[0_0_0_2px_var(--color-bg)]" style={{ background: t.c1 }} />
                      <span className="-ml-1.5 size-4.5 rounded-full shadow-[0_0_0_2px_var(--color-bg)]" style={{ background: t.c2 }} />
                    </span>
                    <span className="flex flex-1 flex-col leading-[1.3]">
                      <span className="text-[15px] font-semibold text-ink">{t.nome}</span>
                      <span className="text-label-sm leading-[1.3] text-ink-3">{t.desc}</span>
                    </span>
                    {on && (
                      <span className="inline-flex items-center gap-1 text-label-sm font-semibold text-ink">
                        <Icon name="check" size={18} /> Atual
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mx-3 mt-1 mb-0 text-[12.5px] leading-[18px] text-ink-3">
            O alto contraste e o modo escuro do menu de acessibilidade têm prioridade sobre o tema.
          </p>
          <span aria-hidden="true" className="mx-3 my-1.5 h-px bg-line" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              repor()
            }}
            className="flex min-h-11 items-center gap-2.5 rounded-item border-0 bg-transparent px-3 text-left text-[15px] text-ink-2 hover:bg-soft-hover"
          >
            <Icon name="reset" size={18} /> Recomeçar a demonstração
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              sair()
            }}
            className="flex min-h-11 items-center gap-2.5 rounded-item border-0 bg-transparent px-3 text-left text-[15px] text-ink-2 hover:bg-soft-hover"
          >
            <Icon name="logOut" size={18} /> Terminar sessão
          </button>
        </div>
      )}
    </div>
  )
}

/** Floating top bar: the person's unit and the account menu */
export function Topbar({ me }: { me: Persona }) {
  return (
    <div className="relative z-30 box-border w-full bg-bg px-4 py-2.5 text-ink sm:px-10">
      <header className="box-border flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 rounded-pill border-emph border-line-strong bg-bg py-1.5 pr-2 pl-4.5 shadow-island">
        <p className="m-0 flex-[1_1_200px] text-[14px] leading-5 text-ink-3">{me.unidade}</p>
        <AccountMenu me={me} />
      </header>
    </div>
  )
}
