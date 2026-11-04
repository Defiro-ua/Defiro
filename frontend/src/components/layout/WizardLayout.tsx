import type { ReactNode } from 'react'
import { Button } from '../Button'

type Props = {
  /** Centred title of the header, e.g. the workflow's name */
  title: string
  /** How far the person is, 0 to 100 */
  pct: number
  exitTo: string
  /** Read after «Sair»: «sem submeter» */
  exitSr: string
  onExit?: () => void
  children: ReactNode
}

/**
 * Full-screen form, one question at a time (request form and «Criar
 * workflow»): a header with a progress bar and «Sair» at the top right.
 */
export function WizardLayout({ title, pct, exitTo, exitSr, onExit, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="relative box-border flex min-h-16 items-center justify-center border-b border-line bg-bg px-8 py-3">
        <a
          className="skip-link"
          href="#passo-titulo"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('passo-titulo')?.focus()
          }}
        >
          Saltar para a pergunta
        </a>
        <a className="skip-link" href="#botao-acessibilidade">
          Ir para o menu de acessibilidade
        </a>
        <h1 className="m-0 text-center text-[17px] leading-6 font-semibold">{title}</h1>
      </header>
      <div aria-hidden="true" className="h-1.5 bg-line">
        <div className="h-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <main id="conteudo" tabIndex={-1} className="box-border flex w-full flex-1 flex-col items-center px-4 pt-4 pb-28 outline-none sm:px-8">
        <div className="flex justify-end self-stretch">
          <Button to={exitTo} onClick={onExit} variant="secondary" size="l" icon="x">
            Sair<span className="sr-only"> {exitSr}</span>
          </Button>
        </div>
        {children}
      </main>
    </div>
  )
}
