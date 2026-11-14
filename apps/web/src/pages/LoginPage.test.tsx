import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

function Address() {
  const { pathname, search } = useLocation()
  return <span data-testid="address">{pathname + search}</span>
}

function renderAt(address: string) {
  return render(
    <MemoryRouter initialEntries={[address]}>
      <LoginPage />
      <Address />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('has a single «Entrar», which opens the organization’s sign-in page', () => {
    renderAt('/')

    const entrar = screen.getAllByRole('link', { name: 'Entrar' })
    expect(entrar).toHaveLength(1)
    expect(entrar[0]).toHaveAttribute('href', '/oauth2/authorization/entra')
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument()
  })

  it('asks for no password: there is no password field', () => {
    const { container } = renderAt('/')

    expect(container.querySelector('input[type="password"]')).toBeNull()
  })

  it('shows «Sessão terminada» after signing out', async () => {
    renderAt('/?aviso=sessao-terminada')

    expect(await within(screen.getByRole('status')).findByText('Sessão terminada')).toBeInTheDocument()
  })

  it('takes the notice out of the address, so reloading the page does not show it again', async () => {
    renderAt('/?aviso=sessao-terminada')

    await screen.findByText('Sessão terminada')
    expect(screen.getByTestId('address')).toHaveTextContent(/^\/$/)
  })

  it('shows no notice when arriving without one', async () => {
    renderAt('/')

    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('ignores a notice it does not know', async () => {
    renderAt('/?aviso=outra-coisa')

    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('closes the notice', async () => {
    renderAt('/?aviso=sessao-terminada')
    await screen.findByText('Sessão terminada')

    await userEvent.click(screen.getByRole('button', { name: 'Fechar o aviso' }))

    expect(screen.queryByText('Sessão terminada')).not.toBeInTheDocument()
  })
})
