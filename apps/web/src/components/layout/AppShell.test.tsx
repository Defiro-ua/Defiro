import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '../../api/session'
import { signOut } from '../../api/session'
import { leaveTo } from '../../lib/leaveTo'
import { AppShell } from './AppShell'

vi.mock('../../api/session', () => ({ signOut: vi.fn() }))
vi.mock('../../lib/leaveTo', () => ({ leaveTo: vi.fn() }))

const ana: Profile = {
  name: 'Ana Ferreira',
  unit: 'Divisão de Recursos Humanos',
  jobTitle: 'Técnica superior',
  manager: 'Sofia Almeida',
  menu: ['new-request', 'inbox'],
}

function renderShell(profile = ana) {
  render(
    <MemoryRouter>
      <AppShell profile={profile} active="inbox">
        <h1>Caixa de tarefas</h1>
      </AppShell>
    </MemoryRouter>,
  )
}

async function clickSignOut() {
  await userEvent.click(screen.getByRole('button', { name: /menu da conta/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Terminar sessão' }))
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset()
    vi.mocked(leaveTo).mockReset()
  })

  it('shows the side menu the server allows this person', () => {
    renderShell()

    const nav = screen.getByRole('navigation', { name: 'Menu principal' })
    expect(within(nav).getByRole('link', { name: 'Caixa de tarefas' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).queryByRole('link', { name: 'Workflows' })).not.toBeInTheDocument()
  })

  it('shows who is signed in on the top bar', () => {
    renderShell()

    expect(within(screen.getByRole('banner')).getByText('Ana Ferreira')).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Técnica superior')).toBeInTheDocument()
  })

  it('puts the screen in the main landmark, where «Saltar para o conteúdo principal» goes', () => {
    renderShell()

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'conteudo')
    expect(main).toContainElement(screen.getByRole('heading', { level: 1, name: 'Caixa de tarefas' }))
  })

  it('on «Terminar sessão», ends the session on the server and goes where the server says', async () => {
    vi.mocked(signOut).mockResolvedValue('http://localhost/?aviso=sessao-terminada')
    renderShell()

    await clickSignOut()

    expect(signOut).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => expect(leaveTo).toHaveBeenCalledWith('http://localhost/?aviso=sessao-terminada'))
  })

  it('says so when the session could not be ended, and stays on the screen', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('POST /logout answered 500'))
    renderShell()

    await clickSignOut()

    expect(await within(screen.getByRole('status')).findByText('Não foi possível terminar a sessão')).toBeInTheDocument()
    expect(leaveTo).not.toHaveBeenCalled()
  })

  it('closes that notice', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('POST /logout answered 500'))
    renderShell()
    await clickSignOut()
    await screen.findByText('Não foi possível terminar a sessão')

    await userEvent.click(screen.getByRole('button', { name: 'Fechar o aviso' }))

    expect(screen.queryByText('Não foi possível terminar a sessão')).not.toBeInTheDocument()
  })
})
