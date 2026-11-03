import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import {
  canSpeak,
  countActive,
  defaultA11y,
  isProfileOn,
  profiles,
  speak,
  type A11ySettings,
  type ProfileId,
} from '../../lib/a11y'
import { useA11y } from '../../lib/a11yContext'
import { cx } from '../../lib/cx'
import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'

const profileIcon: Record<ProfileId, IconName> = {
  visao: 'eye',
  daltonismo: 'palette',
  dislexia: 'book',
  epilepsia: 'zap',
  teclado: 'keyboard',
}

type Adjustment = {
  key: keyof A11ySettings
  label: string
  icon: IconName
  values: Array<A11ySettings[keyof A11ySettings]>
  texts: string[]
}

/** Each tile cycles through its values; the first one is "off". */
const adjustments: Adjustment[] = [
  { key: 'cor', label: 'Contraste +', icon: 'contrast', values: ['padrao', 'contraste', 'escuro'], texts: ['Desligado', 'Claro', 'Escuro'] },
  { key: 'cor', label: 'Daltonismo', icon: 'palette', values: ['padrao', 'vermelho-verde', 'azul-amarelo'], texts: ['Desligado', 'Vermelho-verde', 'Azul-amarelo'] },
  { key: 'sat', label: 'Saturação', icon: 'droplet', values: ['', 'baixa', 'alta', 'cinza'], texts: ['Normal', 'Baixa', 'Alta', 'Sem cor'] },
  { key: 'texto', label: 'Texto maior', icon: 'textSize', values: ['1', '1.25', '1.5', '2'], texts: ['100%', '125%', '150%', '200%'] },
  { key: 'esp', label: 'Espaço entre letras', icon: 'letterSpacing', values: ['0', '1', '2', '3'], texts: ['Normal', 'Leve', 'Médio', 'Amplo'] },
  { key: 'lh', label: 'Altura das linhas', icon: 'lineHeight', values: ['0', '1', '2', '3'], texts: ['Normal', '1,6', '1,8', '2'] },
  { key: 'links', label: 'Realçar ligações', icon: 'link', values: [false, true], texts: ['Desligado', 'Ligado'] },
  { key: 'fonte', label: 'Tipo de letra', icon: 'typeface', values: ['', 'legivel', 'dislexia'], texts: ['Padrão', 'Legível', 'Para dislexia'] },
  { key: 'foco', label: 'Foco reforçado', icon: 'target', values: [false, true], texts: ['Desligado', 'Ligado'] },
  { key: 'pausa', label: 'Parar animações', icon: 'pause', values: [false, true], texts: ['Desligado', 'Ligado'] },
  { key: 'voz', label: 'Ler em voz alta', icon: 'volume', values: [false, true], texts: ['Desligado', 'Ligado: clique ou Tab'] },
]

const tileBase = 'flex min-h-27 w-full flex-col items-start gap-1 rounded-item px-2.5 pt-2.5 pb-2.25 text-left text-ink'
const tileOn = 'border-2 border-orange bg-accent-soft'
const tileOff = 'border border-line-strong bg-panel hover:border-orange'

type Heading = { text: string; level: number; el: HTMLElement }

/** Floating accessibility button (bottom left) and its side panel (component "Menu de acessibilidade"). */
export function A11yMenu() {
  const { settings, update, reset } = useA11y()
  const [open, setOpen] = useState(false)
  const [profilesOpen, setProfilesOpen] = useState(false)
  const [headings, setHeadings] = useState<Heading[] | null>(null)
  const [toast, setToast] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const structureTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])
  useEffect(() => {
    if (headings) structureTitleRef.current?.focus()
  }, [headings])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const active = countActive(settings)
  const activeProfiles = profiles.filter((p) => isProfileOn(settings, p.settings)).length
  const zoom = Number(settings.texto)

  function close(returnFocus = true) {
    setOpen(false)
    setHeadings(null)
    if (returnFocus) buttonRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      event.stopPropagation()
      close()
    }
  }

  // A keyboard user who tabs out of the open menu goes back to the page: close it so it does not cover the focus
  function onBlur(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (open && next && !rootRef.current?.contains(next)) close(false)
  }

  function toggleProfile(id: ProfileId) {
    const profile = profiles.find((p) => p.id === id)!
    if (isProfileOn(settings, profile.settings)) {
      const off = Object.fromEntries(Object.keys(profile.settings).map((k) => [k, defaultA11y[k as keyof A11ySettings]]))
      update(off)
    } else update(profile.settings)
  }

  function cycle(adjustment: Adjustment) {
    const index = Math.max(0, adjustment.values.indexOf(settings[adjustment.key]))
    const next = adjustment.values[(index + 1) % adjustment.values.length]
    if (adjustment.key === 'voz') {
      if (!canSpeak()) return
      if (next) speak('Leitura em voz alta ligada. Carregue num texto, ou mude de elemento com a tecla Tab, para o ouvir.')
    }
    update({ [adjustment.key]: next })
  }

  function toggleStructure() {
    if (headings) {
      setHeadings(null)
      return
    }
    const main = document.getElementById('conteudo') ?? document.body
    const found = Array.from(main.querySelectorAll<HTMLElement>('h1, h2, h3')).filter(
      (h) => h.offsetParent !== null && !h.closest('dialog') && !h.closest('[data-a11y-menu]'),
    )
    setHeadings(found.map((el) => ({ text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(), level: Number(el.tagName[1]), el })))
  }

  function goTo(heading: Heading) {
    close(false)
    const el = heading.el
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.scrollIntoView({ block: 'start' })
    el.focus({ preventScroll: true })
  }

  return (
    <div ref={rootRef} data-a11y-menu onKeyDown={onKeyDown} onBlur={onBlur} className="text-ink">
      {open && (
        <section
          id="painel-acessibilidade"
          role="dialog"
          aria-modal="false"
          aria-labelledby="acessibilidade-titulo"
          // Under "Texto maior" the page is zoomed, so the panel height is divided back to fit the screen
          style={{ height: `calc(100dvh / ${zoom})` }}
          className="fixed right-0 bottom-0 z-50 w-110 max-w-full animate-slide-in overflow-auto border-l border-line-strong bg-bg shadow-sheet-left"
        >
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line-strong bg-footer py-4 pr-4 pl-5.5 text-on-dark">
            <Icon name="accessibility" size={24} />
            <h2 id="acessibilidade-titulo" ref={titleRef} tabIndex={-1} className="flex-1 text-title-sm leading-6 font-semibold outline-none">
              Menu de acessibilidade
            </h2>
            <button
              type="button"
              onClick={() => close()}
              aria-label="Fechar o menu de acessibilidade"
              className="grid size-11 place-items-center rounded-full border-emph border-field bg-bg text-ink hover:bg-soft"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
            <p className="text-label-sm leading-4.75 text-ink-2">
              As escolhas ficam guardadas neste navegador e valem nos outros ecrãs.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setProfilesOpen((v) => !v)}
                aria-expanded={profilesOpen}
                aria-controls="perfis-acessibilidade"
                className="flex min-h-13 w-full items-center gap-2.5 rounded-item border border-line-strong bg-soft px-3.5 text-left text-label-md font-semibold text-ink"
              >
                <Icon name="user" size={20} />
                <span className="flex-1">Perfis de acessibilidade</span>
                {activeProfiles > 0 && <span>{activeProfiles === 1 ? '1 ativo' : `${activeProfiles} ativos`}</span>}
                <Icon name={profilesOpen ? 'chevronUp' : 'chevronDown'} size={18} />
              </button>
              {profilesOpen && (
                <ul id="perfis-acessibilidade" aria-label="Perfis" className="flex flex-col gap-1.5">
                  {profiles.map((profile) => {
                    const on = isProfileOn(settings, profile.settings)
                    return (
                      <li key={profile.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleProfile(profile.id)}
                          className={cx('flex min-h-14 w-full items-center gap-3 rounded-item px-3 py-2 text-ink', on ? tileOn : tileOff)}
                        >
                          <Icon name={profileIcon[profile.id]} size={22} className="text-accent-ink" />
                          <span className="flex flex-1 flex-col gap-px text-left">
                            <span className="text-body-sm font-semibold">{profile.name}</span>
                            <span className="text-caption text-ink-2">{profile.description}</span>
                          </span>
                          {on && (
                            <span className="inline-flex shrink-0 items-center gap-1 text-caption font-semibold">
                              <Icon name="check" size={16} />
                              Ativo
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <h3 id="ajustes" className="mt-1 text-label-md font-semibold">
              Ajustes
            </h3>
            <ul aria-labelledby="ajustes" className="grid grid-cols-3 gap-2">
              {adjustments.map((adjustment) => {
                const index = Math.max(0, adjustment.values.indexOf(settings[adjustment.key]))
                const on = index > 0
                const unavailable = adjustment.key === 'voz' && !canSpeak()
                return (
                  <li key={adjustment.label} className="flex">
                    <button type="button" aria-pressed={on} onClick={() => cycle(adjustment)} className={cx(tileBase, on ? tileOn : tileOff)}>
                      <Icon name={adjustment.icon} size={26} className={on ? 'text-orange' : 'text-accent-ink'} />
                      <span className="text-label-sm leading-4.25 font-semibold">{adjustment.label}</span>
                      <span className="text-caption leading-4 text-ink-2">
                        <span className="sr-only">: </span>
                        {unavailable ? 'Indisponível neste navegador' : adjustment.texts[index]}
                      </span>
                      {adjustment.values.length > 2 && (
                        <span aria-hidden="true" className="mt-auto flex min-h-1.5 gap-0.75">
                          {adjustment.values.slice(1).map((_, i) => (
                            <span
                              key={i}
                              className={cx('h-1.5 w-3.5 rounded-xs', i < index ? 'bg-orange' : 'border-emph border-line-strong')}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
              <li className="flex">
                <button
                  type="button"
                  aria-expanded={!!headings}
                  aria-controls="estrutura-pagina"
                  onClick={toggleStructure}
                  className={cx(tileBase, headings ? tileOn : tileOff)}
                >
                  <Icon name="list" size={26} className={headings ? 'text-orange' : 'text-accent-ink'} />
                  <span className="text-label-sm leading-4.25 font-semibold">Estrutura da página</span>
                  <span className="text-caption leading-4 text-ink-2">
                    <span className="sr-only">: </span>
                    {headings ? 'Aberta' : 'Ver os títulos'}
                  </span>
                </button>
              </li>
            </ul>

            {headings && (
              <section
                id="estrutura-pagina"
                aria-labelledby="estrutura-titulo"
                className="flex flex-col gap-1.5 rounded-item border border-line-strong bg-panel p-3"
              >
                <h3 id="estrutura-titulo" ref={structureTitleRef} tabIndex={-1} className="mb-1 text-body-sm font-semibold outline-none">
                  Títulos desta página
                </h3>
                <ul className="flex flex-col gap-0.5">
                  {headings.map((heading, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => goTo(heading)}
                        className={cx(
                          'flex min-h-10 w-full items-center gap-2.5 rounded-tile py-1 pr-2 text-left text-body-sm text-accent-ink underline underline-offset-3 hover:bg-soft',
                          heading.level === 1 ? 'pl-2' : heading.level === 2 ? 'pl-5.5' : 'pl-9',
                        )}
                      >
                        <span className="min-w-6.5 shrink-0 rounded-doc bg-soft px-1.5 text-center text-micro font-semibold text-ink no-underline">
                          T{heading.level}
                        </span>
                        <span>{heading.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Button
              variant="secondary"
              icon="reset"
              block
              onClick={() => {
                reset()
                setToast('Definições repostas')
              }}
            >
              Repor todas as definições
            </Button>
          </div>
        </section>
      )}

      <button
        ref={buttonRef}
        type="button"
        id="botao-acessibilidade"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="painel-acessibilidade"
        className="fixed bottom-6 left-6 z-40 grid size-16 place-items-center rounded-full border-3 border-bg bg-ink text-bg shadow-a11y"
      >
        <Icon name="accessibility" size={32} />
        <span className="sr-only">
          Menu de acessibilidade
          {active > 0 && `, ${active === 1 ? '1 ajuste ativo' : `${active} ajustes ativos`}`}
        </span>
        {active > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 grid h-6 min-w-6 place-items-center rounded-pill border-2 border-bg bg-orange px-1.5 text-caption font-extrabold text-on-brand"
          >
            {active}
          </span>
        )}
      </button>

      <div role="status" aria-live="polite">
        {toast && (
          <p className="fixed inset-x-0 top-4 z-50 mx-auto flex w-max max-w-screen-gutter animate-toast items-center gap-3 rounded-lg border border-line-strong bg-panel py-2.5 pr-4.5 pl-3 text-label-md leading-5.5 font-semibold text-ink shadow-menu">
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-bg">
              <Icon name="check" size={16} />
            </span>
            {toast}
          </p>
        )}
      </div>
    </div>
  )
}
