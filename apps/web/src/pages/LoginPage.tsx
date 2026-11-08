import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { Flash } from '../components/Flash'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { personaIds, personas } from '../domain/people'
import { useFlash } from '../lib/useFlash'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { useNativeDialog } from '../lib/useNativeDialog'
import { useDemo } from '../state/demoContext'

const steps = [
  { n: '1', t: 'Desenhar', d: 'Desenhe o workflow: os passos, quem trata cada um e os dados de que cada passo precisa.' },
  { n: '2', t: 'Gerar', d: 'A defiro cria a aplicação: formulários, caixas de tarefas, aprovações e notificações.' },
  { n: '3', t: 'Executar', d: 'Cada pedido é acompanhado e cada alteração fica registada.' },
]

const footerColumns = [
  {
    titulo: 'Orientadores',
    ligacoes: [
      { t: 'Osvaldo Pacheco', href: 'https://www.ua.pt/pt/p/10313442' },
      { t: 'Daniel Ferreira', href: 'https://www.ua.pt/pt/p/80653922' },
    ],
  },
  {
    titulo: 'Projeto',
    ligacoes: [
      { t: 'Equipa', href: 'https://defiro-ua.github.io/website/team.html' },
      { t: 'Calendário', href: 'https://defiro-ua.github.io/website/calendar.html' },
      { t: 'Relatórios', href: 'https://defiro-ua.github.io/website/reports.html' },
    ],
  },
  {
    titulo: 'Outras ligações',
    ligacoes: [
      { t: 'Site do projeto', href: 'https://defiro-ua.github.io/website/' },
      { t: 'GitHub', href: 'https://github.com/Defiro-ua/Defiro' },
    ],
  },
]

/** E01 · Entrar (UC01): welcome screen; «Entrar» opens the choice of account of the demo */
export function LoginPage() {
  const { entrar } = useDemo()
  const [flash, closeFlash] = useFlash()
  const [open, setOpen] = useState(false)
  const { ref: dialogRef, onCancel, onClick } = useNativeDialog(open, () => setOpen(false))
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)

  return (
    <div className="bg-login relative flex min-h-screen flex-col text-ink">
      <header className="relative z-3 px-4 pt-6 sm:px-16">
        <a className="skip-link" href="#botao-acessibilidade">
          Ir para o menu de acessibilidade
        </a>
        <div className="box-border flex min-h-16 flex-wrap items-center gap-x-4.5 gap-y-2.5 rounded-pill border-emph border-line-strong bg-bg py-2 pr-2.5 pl-6 shadow-island">
          <Logo className="h-8" />
          <span aria-hidden="true" className="flex-[1_1_200px]" />
          <Button icon="logIn" iconSize={20} onClick={() => setOpen(true)}>
            Entrar
          </Button>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="relative z-1 flex flex-1 flex-col outline-none">
        <Flash notice={flash} onClose={closeFlash} />
        <section aria-labelledby="titulo-inicio" className="relative box-border flex min-h-[560px] items-center px-4 pt-18 pb-24 sm:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
            <span className="bg-brand-bar absolute top-12 right-[8%] h-75 w-29 rounded-[26px]" />
            <span className="bg-brand-bar absolute top-28 right-[calc(8%+162px)] h-21.5 w-8.5 rounded-[26px]" />
            <span className="bg-brand-bar absolute right-[27%] -bottom-8.5 h-35 w-10 rounded-[26px]" />
            <span className="bg-brand-bar absolute right-[calc(8%+38px)] -bottom-13.5 h-32.5 w-10 rounded-[26px]" />
          </div>
          <div className="relative flex max-w-[720px] flex-col gap-6">
            <h1
              id="titulo-inicio"
              ref={headingRef}
              tabIndex={-1}
              className="m-0 text-[clamp(44px,6vw,76px)] leading-[1.05] font-extrabold tracking-display outline-none"
            >
              Os seus pedidos, <span className="block text-orange">sem papel.</span>
            </h1>
            <p className="m-0 max-w-prose-md text-[21px] leading-[1.6] text-ink-2">
              Faça pedidos, acompanhe-os e decida sobre os da sua equipa, tudo num só lugar.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button href="#como-funciona" variant="secondary" size="xl" iconRight="arrowDown" iconSize={20}>
                Como funciona
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="como-funciona" className="edge relative bg-soft px-4 pt-20 pb-24 sm:px-16">
          <h2 id="como-funciona" tabIndex={-1} className="m-0 mb-14 text-[42px] leading-[1.15] font-extrabold tracking-headline outline-none">
            Como <span className="text-orange">funciona</span>
          </h2>
          <div className="relative">
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 600 160"
              preserveAspectRatio="none"
              className="absolute top-0 left-0 hidden h-40 w-full overflow-visible md:block"
            >
              <defs>
                <linearGradient id="linha-como" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" style={{ stopColor: 'var(--color-yellow)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--color-orange)' }} />
                </linearGradient>
              </defs>
              <path
                d="M 12 36 L 100 36 C 200 36 200 116 300 116 C 400 116 400 36 500 36 L 566 36"
                fill="none"
                stroke="url(#linha-como)"
                strokeWidth="9"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span aria-hidden="true" className="absolute top-[25px] left-[calc(2%-11px)] hidden size-5.5 rounded-full bg-yellow md:block" />
            <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 28 28" className="absolute top-[22px] left-[calc(94.33%-6px)] hidden md:block">
              <path d="M4 3 L25 14 L4 25 Z" style={{ fill: 'var(--color-orange)' }} strokeLinejoin="round" />
            </svg>
            <ol className="relative m-0 grid list-none grid-cols-1 gap-y-10 p-0 md:grid-cols-3 md:gap-y-0">
              {steps.map((x, i) => (
                <li key={x.n} className={'relative flex flex-col items-center px-6 text-center ' + (i === 1 ? 'md:pt-22' : 'md:pt-2')}>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-9 right-[10%] z-0 text-[200px] leading-none font-extrabold tracking-[-0.04em] text-ink opacity-5"
                  >
                    {x.n}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative z-1 grid size-14 place-items-center rounded-full bg-brand text-[20px] font-extrabold text-on-brand shadow-[0_0_0_6px_var(--color-soft)]"
                  >
                    {x.n}
                  </span>
                  <h3 className="relative z-1 mt-5 mb-2 text-[22px] leading-7 font-extrabold tracking-heading">
                    <span className="sr-only">Passo {x.n}: </span>
                    {x.t}
                  </h3>
                  <p className="relative z-1 m-0 max-w-[30ch] text-[16px] leading-[1.6] text-ink-2">{x.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="relative z-1 bg-footer px-4 pt-14 pb-11 text-footer-ink sm:px-16">
        <div className="flex flex-wrap gap-x-14 gap-y-9">
          <div className="flex flex-[2_1_340px] flex-col gap-3">
            <Logo variant="white" className="h-10 self-start" />
            <p className="m-0 max-w-prose-md text-[14px] leading-[1.6]">
              Uma plataforma de automação de workflows, adaptável a qualquer cenário. Projeto em Engenharia Informática, Universidade de Aveiro.
            </p>
            <p className="m-0 text-[14px] leading-[1.6]">PEI 2026/27 · Universidade de Aveiro</p>
          </div>
          {footerColumns.map((c) => (
            <div key={c.titulo} className="flex flex-[1_1_170px] flex-col gap-3">
              <h2 className="m-0 text-[15px] leading-5 font-semibold text-footer-head">{c.titulo}</h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {c.ligacoes.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] leading-5 text-footer-ink underline underline-offset-3 hover:text-footer-head"
                    >
                      {l.t}
                      <span className="sr-only"> (abre noutra janela)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        onCancel={onCancel}
        onClick={onClick}
        onClose={() => setOpen(false)}
        aria-labelledby="contas-titulo"
        aria-describedby="contas-intro"
        className="w-[560px] font-sans"
      >
        <div className="box-border flex max-h-[calc(100vh-48px)] flex-col gap-4 overflow-auto rounded-menu border border-edge bg-bg p-7 text-ink">
          <div className="flex flex-col gap-1.5">
            <h2 id="contas-titulo" className="m-0 text-[22px] leading-[30px] font-extrabold tracking-heading">
              Escolha a conta
            </h2>
            <span className="edge self-start rounded-sm bg-warning-soft px-2.5 py-0.5 text-caption font-semibold text-warning">Só na demonstração</span>
          </div>
          <p id="contas-intro" className="m-0 text-[15px] leading-[23px] text-ink-2">
            Na aplicação real, aqui abre a página de início de sessão do fornecedor de identidade (IdP) da sua organização. Para a demonstração, escolha com quem
            quer entrar.
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {personaIds.map((id) => {
              const p = personas[id]
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      entrar(id)
                    }}
                    className="choice-card flex min-h-16 w-full items-center gap-3.5 rounded-item border border-line-strong bg-panel px-3.5 py-2 text-left text-ink"
                  >
                    <span aria-hidden="true" className="grid size-10.5 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-extrabold text-on-brand">
                      {p.ini}
                    </span>
                    <span className="flex flex-1 flex-col leading-[1.35]">
                      <span className="text-[16px] font-semibold">
                        {p.nome}
                        <span className="sr-only">,</span> <span className="font-normal text-ink-3">· {p.papel}</span>
                      </span>
                      <span className="text-label-sm leading-[1.35] text-ink-2">
                        {p.funcao} · {p.desc}
                      </span>
                    </span>
                    <Icon name="arrowRight" size={18} className="text-accent-ink" />
                  </button>
                </li>
              )
            })}
          </ul>
          <Button variant="secondary" className="self-end" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </dialog>
    </div>
  )
}
