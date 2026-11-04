/*
 * Accessibility settings of the floating accessibility menu (component
 * "Menu de acessibilidade" of the mockup). They are kept in this browser and
 * applied to <html> as data attributes, which the rules in index.css read.
 */

export type ColorMode = 'padrao' | 'contraste' | 'escuro' | 'vermelho-verde' | 'azul-amarelo'
export type Saturation = '' | 'baixa' | 'alta' | 'cinza'
export type TextScale = '1' | '1.25' | '1.5' | '2'
export type Step = '0' | '1' | '2' | '3'
export type FontChoice = '' | 'legivel' | 'dislexia'
/** Brand colours: defiro (orange) or Câmara Municipal de Aveiro (blue of the ria) */
export type Theme = 'defiro' | 'cma'

export type A11ySettings = {
  /** Contrast (light/dark) and colour-blind palettes share one setting: only one palette applies at a time */
  cor: ColorMode
  texto: TextScale
  sat: Saturation
  /** Letter and word spacing */
  esp: Step
  /** Line height */
  lh: Step
  links: boolean
  fonte: FontChoice
  foco: boolean
  pausa: boolean
  voz: boolean
  /** Chosen in the account menu; high contrast and dark mode take priority over it */
  tema: Theme
}

export const defaultA11y: A11ySettings = {
  cor: 'padrao',
  texto: '1',
  sat: '',
  esp: '0',
  lh: '0',
  links: false,
  fonte: '',
  foco: false,
  pausa: false,
  voz: false,
  tema: 'defiro',
}

export const themes: Array<{ id: Theme; nome: string; desc: string; c1: string; c2: string }> = [
  { id: 'defiro', nome: 'defiro', desc: 'Laranja, a cor do projeto.', c1: '#e7a718', c2: '#da6202' },
  { id: 'cma', nome: 'Câmara Municipal de Aveiro', desc: 'Azul da ria, da identidade da Câmara.', c1: '#4fb3d3', c2: '#0087b1' },
]

export type ProfileId = 'visao' | 'daltonismo' | 'dislexia' | 'epilepsia' | 'teclado'

/** Ready-made combinations of settings */
export const profiles: Array<{ id: ProfileId; name: string; description: string; settings: Partial<A11ySettings> }> = [
  { id: 'visao', name: 'Visão reduzida', description: 'Texto a 150%, contraste claro e ligações realçadas', settings: { texto: '1.5', cor: 'contraste', links: true } },
  { id: 'daltonismo', name: 'Daltonismo', description: 'Cores para daltonismo vermelho-verde', settings: { cor: 'vermelho-verde' } },
  { id: 'dislexia', name: 'Dislexia', description: 'Letra Lexend, mais espaço entre letras e linhas', settings: { fonte: 'dislexia', esp: '2', lh: '2' } },
  { id: 'epilepsia', name: 'Epilepsia e convulsões', description: 'Sem animações e com cores menos intensas', settings: { pausa: true, sat: 'baixa' } },
  { id: 'teclado', name: 'Navegação por teclado', description: 'Foco reforçado e ligações realçadas', settings: { foco: true, links: true } },
]

const STORAGE_KEY = 'defiro.a11y'

export function loadA11y(): A11ySettings {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<A11ySettings>
    const merged = { ...defaultA11y, ...saved, texto: String(saved.texto || '1') as TextScale }
    return merged.tema === 'cma' ? merged : { ...merged, tema: 'defiro' }
  } catch {
    return defaultA11y
  }
}

export function saveA11y(settings: A11ySettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Private mode or blocked storage: the settings still apply to this visit
  }
}

/** Space-separated tokens for the `data-a11y` attribute */
export function a11yTokens(a: A11ySettings): string {
  const tokens: string[] = []
  if (a.esp !== '0') tokens.push(`esp${a.esp}`)
  if (a.lh !== '0') tokens.push(`lh${a.lh}`)
  if (a.links) tokens.push('links')
  if (a.fonte) tokens.push(`fonte-${a.fonte}`)
  if (a.foco) tokens.push('foco')
  if (a.pausa) tokens.push('pausa')
  if (a.sat) tokens.push(`sat-${a.sat}`)
  if (a.cor === 'vermelho-verde' || a.cor === 'azul-amarelo') tokens.push('dalt')
  return tokens.join(' ')
}

/** How many settings differ from the defaults (badge on the menu button); the theme is not an accessibility setting */
export function countActive(a: A11ySettings): number {
  return (Object.keys(defaultA11y) as Array<keyof A11ySettings>).filter((k) => k !== 'tema' && a[k] !== defaultA11y[k]).length
}

export function isProfileOn(a: A11ySettings, settings: Partial<A11ySettings>): boolean {
  return (Object.keys(settings) as Array<keyof A11ySettings>).every((k) => a[k] === settings[k])
}

/** Reads a text aloud in European Portuguese, if the browser can. */
export function speak(text: string) {
  try {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-PT'
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech not available
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    // Speech not available
  }
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** What to say for an element: its accessible name, its kind and its state, roughly as a screen reader would. */
export function describeElement(el: Element): string {
  const clean = (s: string | null | undefined) =>
    String(s ?? '')
      .replace(/\(obrigatório\)/g, '')
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  const byIds = (ids: string | null) =>
    clean(
      (ids ?? '')
        .split(/\s+/)
        .map((id) => (id ? document.getElementById(id)?.textContent : ''))
        .filter(Boolean)
        .join('. '),
    )
  const tag = el.tagName
  const type = (el.getAttribute('type') ?? '').toLowerCase()
  const field = el as HTMLInputElement
  let name = clean(el.getAttribute('aria-label')) || byIds(el.getAttribute('aria-labelledby'))
  if (!name && field.labels?.length) name = clean(field.labels[0].textContent)
  if (!name && !/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) name = clean((el as HTMLElement).innerText)
  if (!name) name = clean(el.getAttribute('placeholder'))

  const states: string[] = []
  let role = ''
  if (tag === 'A') role = 'ligação'
  else if (tag === 'BUTTON') role = el.getAttribute('role') === 'tab' ? 'separador' : el.getAttribute('role') === 'switch' ? 'interruptor' : 'botão'
  else if (tag === 'SELECT') role = 'lista'
  else if (tag === 'TEXTAREA') role = 'caixa de texto'
  else if (tag === 'INPUT') {
    if (type === 'checkbox') role = 'caixa de seleção'
    else if (type === 'radio') role = 'opção'
    else if (type === 'file') role = 'botão para escolher ficheiro'
    else role = 'campo de texto'
    if (type === 'checkbox' || type === 'radio') states.push(field.checked ? 'selecionada' : 'não selecionada')
    else if (type !== 'file') states.push(field.value ? clean(field.value) : 'vazio')
  } else if (/^H[1-6]$/.test(tag)) role = 'título'

  const expanded = el.getAttribute('aria-expanded')
  if (expanded) states.push(expanded === 'true' ? 'aberto' : 'fechado')
  const pressed = el.getAttribute('aria-pressed') ?? el.getAttribute('aria-checked')
  if (pressed) states.push(pressed === 'true' ? 'ligado' : 'desligado')
  if (el.getAttribute('aria-selected') === 'true') states.push('selecionado')
  const current = el.getAttribute('aria-current')
  if (current === 'page') states.push('página atual')
  if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') states.push('indisponível')
  if (field.required || el.getAttribute('aria-required') === 'true') states.push('obrigatório')
  if (el.getAttribute('aria-invalid') === 'true') states.push('inválido')
  const description = byIds(el.getAttribute('aria-describedby'))
  return [name, role, ...states].filter(Boolean).join(', ') + (description ? `. ${description}` : '')
}
