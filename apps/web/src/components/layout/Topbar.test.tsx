import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Profile } from '../../api/session'
import { Topbar } from './Topbar'

const sofia: Profile = {
  name: 'Sofia Almeida',
  unit: 'Divisão de Sistemas de Informação',
  jobTitle: 'Gestora de workflows',
  manager: 'Rui Costa',
  menu: ['create-workflow', 'new-request', 'inbox', 'workflows'],
}

function renderTopbar(onSignOut = vi.fn()) {
  render(
    <>
      <Topbar profile={sofia} onSignOut={onSignOut} />
      <button type="button">Depois da barra</button>
    </>,
  )
  return { onSignOut, account: screen.getByRole('button', { name: /menu da conta/ }) }
}

describe('Topbar', () => {
  it('shows who is signed in: name and job title', () => {
    renderTopbar()

    const bar = screen.getByRole('banner')
    expect(within(bar).getByText('Sofia Almeida')).toBeInTheDocument()
    expect(within(bar).getByText('Gestora de workflows')).toBeInTheDocument()
  })

  it('shows the unit the person works in', () => {
    renderTopbar()

    expect(within(screen.getByRole('banner')).getByText('Divisão de Sistemas de Informação')).toBeInTheDocument()
  })

  it('shows the initials of the name', () => {
    renderTopbar()

    expect(screen.getByText('SA')).toHaveAttribute('aria-hidden', 'true')
  })

  it('still offers the account menu when Entra ID sent no name, job title or unit', () => {
    // The server sends null for what the token does not carry
    render(<Topbar profile={{ ...sofia, name: null, jobTitle: null, unit: null, manager: null }} onSignOut={vi.fn()} />)

    expect(screen.getByRole('button', { name: /menu da conta/ })).toBeInTheDocument()
  })

  it('names the account button after the person, and keeps the menu closed until asked', () => {
    const { account } = renderTopbar()

    expect(account).toHaveAccessibleName(/^Sofia Almeida.*menu da conta$/)
    expect(account).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Terminar sessão' })).not.toBeInTheDocument()
  })

  it('opens an account menu whose only action is «Terminar sessão»', async () => {
    const { account } = renderTopbar()

    await userEvent.click(account)

    expect(account).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('region', { name: 'Conta' })
    expect(
      within(panel)
        .getAllByRole('button')
        .map((b) => b.textContent?.trim()),
    ).toEqual(['Terminar sessão'])
  })

  it('signs out once on «Terminar sessão»', async () => {
    const { account, onSignOut } = renderTopbar()

    await userEvent.click(account)
    await userEvent.click(screen.getByRole('button', { name: 'Terminar sessão' }))

    expect(onSignOut).toHaveBeenCalledTimes(1)
  })

  it('closes with Escape and gives the focus back to the account button', async () => {
    const { account } = renderTopbar()
    await userEvent.click(account)
    screen.getByRole('button', { name: 'Terminar sessão' }).focus()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('region', { name: 'Conta' })).not.toBeInTheDocument()
    expect(account).toHaveFocus()
  })

  it('closes when the person clicks somewhere else', async () => {
    const { account } = renderTopbar()
    await userEvent.click(account)

    await userEvent.click(document.body)

    expect(screen.queryByRole('region', { name: 'Conta' })).not.toBeInTheDocument()
  })

  it('closes when the focus leaves it, so it does not cover what has the focus', async () => {
    const { account } = renderTopbar()
    await userEvent.click(account)
    screen.getByRole('button', { name: 'Terminar sessão' }).focus()

    await userEvent.tab()

    expect(screen.getByRole('button', { name: 'Depois da barra' })).toHaveFocus()
    expect(screen.queryByRole('region', { name: 'Conta' })).not.toBeInTheDocument()
  })
})
