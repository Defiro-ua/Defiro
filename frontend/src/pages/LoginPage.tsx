import { Button } from '../components/Button'
import { FlowIllustration } from '../components/FlowIllustration'
import { Logo } from '../components/Logo'
import { paths } from '../routes'

/** E01 · Entrar (UC01) */
export function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-ink">
      <header className="flex items-center px-4 pt-10 md:px-30">
        <Logo className="h-9" />
      </header>

      <FlowIllustration className="pointer-events-none absolute inset-0 hidden size-full xl:block" />

      <main className="relative flex max-w-hero flex-1 flex-col justify-center px-4 py-16 md:px-30 md:pt-0 md:pb-10">
        <h1 className="text-hero">
          Os seus pedidos, <span className="block text-orange">sem papel.</span>
        </h1>
        <p className="mt-6 max-w-prose-md text-lede text-ink-2">
          Todos os seus processos, num só lugar. <br />
          Crie, aprove, edite.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4">
          <Button to={paths.inbox} size="xl" icon="logIn" iconSize={20} glow>
            Entrar com a conta Microsoft
          </Button>
        </div>
      </main>

      <footer className="relative flex h-18 shrink-0 items-center gap-6 bg-footer px-4 text-footer-ink md:px-30">
        <Logo variant="white" className="h-6.5" />
        <span className="text-label-sm text-footer-dim">PEI 2026/27 · Universidade de Aveiro</span>
      </footer>
    </div>
  )
}
