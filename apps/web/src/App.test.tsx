import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from './api/session'
import { fetchProfile } from './api/session'
import { App } from './App'

vi.mock('./api/session', async (original) => ({ ...(await original<typeof import('./api/session')>()), fetchProfile: vi.fn() }))

const sofia: Profile = {
  name: 'Sofia Almeida',
  unit: 'Divisão de Sistemas de Informação',
  jobTitle: 'Gestora de workflows',
  manager: 'Rui Costa',
  menu: ['create-workflow', 'new-request', 'inbox', 'workflows'],
}
const ana: Profile = { ...sofia, name: 'Ana Ferreira', jobTitle: 'Técnica superior', menu: ['new-request', 'inbox'] }

function Address() {
  const { pathname } = useLocation()
  return <span data-testid="address">{pathname}</span>
}

function renderAt(address: string) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <App />
      <Address />
    </MemoryRouter>,
  )
}

const address = () => screen.getByTestId('address').textContent

describe('App', () => {
  beforeEach(() => {
    vi.mocked(fetchProfile).mockReset()
  })

  it('opens on the home page, with «Entrar»', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1, name: /Os seus pedidos/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(fetchProfile).not.toHaveBeenCalled()
  })

  it('is one main landmark, so screen readers can jump to it', () => {
    renderAt('/')

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('after signing in, shows the task inbox with the person’s menu and top bar', async () => {
    vi.mocked(fetchProfile).mockResolvedValue(sofia)
    renderAt('/caixa-de-tarefas')

    expect(await screen.findByRole('heading', { level: 1, name: 'Caixa de tarefas' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Sofia Almeida')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Menu principal' })
    expect(within(nav).getByRole('link', { name: 'Caixa de tarefas' })).toHaveAttribute('aria-current', 'page')
  })

  it('says it is loading while it asks the server who is signed in', () => {
    vi.mocked(fetchProfile).mockReturnValue(new Promise(() => {}))
    renderAt('/caixa-de-tarefas')

    expect(screen.getByRole('status')).toHaveTextContent('A carregar')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('sends someone who is not signed in to the home page', async () => {
    vi.mocked(fetchProfile).mockResolvedValue(null)
    renderAt('/caixa-de-tarefas')

    expect(await screen.findByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(address()).toBe('/')
  })

  it('says so when the server cannot say who is signed in', async () => {
    vi.mocked(fetchProfile).mockRejectedValue(new Error('GET /api/me answered 500'))
    renderAt('/caixa-de-tarefas')

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível abrir a defiro')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('opens each screen of the menu, marked as the current page', async () => {
    vi.mocked(fetchProfile).mockResolvedValue(sofia)
    renderAt('/caixa-de-tarefas')
    const nav = await screen.findByRole('navigation', { name: 'Menu principal' })

    for (const [label, path] of [
      ['Novo pedido', '/novo-pedido'],
      ['Criar workflow', '/workflows/criar'],
      ['Workflows', '/workflows'],
    ]) {
      await userEvent.click(within(nav).getByRole('link', { name: label }))
      expect(await screen.findByRole('heading', { level: 1, name: label })).toBeInTheDocument()
      expect(address()).toBe(path)
      expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page')
    }
  })

  it('keeps the management screens for the Workflow Manager, also when opened by their address', async () => {
    vi.mocked(fetchProfile).mockResolvedValue(ana)
    renderAt('/workflows')

    expect(await screen.findByRole('heading', { level: 1, name: 'Caixa de tarefas' })).toBeInTheDocument()
    expect(address()).toBe('/caixa-de-tarefas')
  })

  it('sends an unknown address to the home page', () => {
    renderAt('/nao-existe')

    expect(address()).toBe('/')
  })
})
