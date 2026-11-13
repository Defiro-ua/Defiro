import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { MenuItem } from '../../api/session'
import { Sidebar } from './Sidebar'

function renderMenu(menu: MenuItem[], active?: MenuItem) {
  render(
    <MemoryRouter>
      <Sidebar menu={menu} active={active} />
    </MemoryRouter>,
  )
  return screen.getByRole('navigation', { name: 'Menu principal' })
}

/** The items of the menu, in order; the skip links are not items */
function items(nav: HTMLElement) {
  return within(nav)
    .getAllByRole('link')
    .filter((link) => !link.classList.contains('skip-link'))
    .map((link) => link.textContent)
}

describe('Sidebar', () => {
  it('shows a Workflow Manager «Criar workflow», «Novo pedido», «Caixa de tarefas» and «Workflows»', () => {
    const nav = renderMenu(['create-workflow', 'new-request', 'inbox', 'workflows'])

    expect(items(nav)).toEqual(['Criar workflow', 'Novo pedido', 'Caixa de tarefas', 'Workflows'])
    expect(within(nav).getByRole('list', { name: 'Gestão' })).toContainElement(within(nav).getByRole('link', { name: 'Workflows' }))
  })

  it('shows any other employee «Novo pedido» and «Caixa de tarefas» only', () => {
    const nav = renderMenu(['new-request', 'inbox'])

    expect(items(nav)).toEqual(['Novo pedido', 'Caixa de tarefas'])
    expect(within(nav).queryByText('Gestão')).not.toBeInTheDocument()
  })

  it('shows what the server allows, not what it guesses from other items', () => {
    const nav = renderMenu(['inbox', 'workflows'])

    expect(items(nav)).toEqual(['Caixa de tarefas', 'Workflows'])
  })

  it('takes each item to its screen', () => {
    const nav = renderMenu(['create-workflow', 'new-request', 'inbox', 'workflows'])

    expect(within(nav).getByRole('link', { name: 'Criar workflow' })).toHaveAttribute('href', '/workflows/criar')
    expect(within(nav).getByRole('link', { name: 'Novo pedido' })).toHaveAttribute('href', '/novo-pedido')
    expect(within(nav).getByRole('link', { name: 'Caixa de tarefas' })).toHaveAttribute('href', '/caixa-de-tarefas')
    expect(within(nav).getByRole('link', { name: 'Workflows' })).toHaveAttribute('href', '/workflows')
  })

  it('marks the screen that is open as the current page, and only that one', () => {
    const nav = renderMenu(['create-workflow', 'new-request', 'inbox', 'workflows'], 'inbox')

    const current = within(nav)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
    expect(current.map((link) => link.textContent)).toEqual(['Caixa de tarefas'])
  })

  it('lets keyboard users skip the menu', () => {
    const nav = renderMenu(['new-request', 'inbox'])

    expect(within(nav).getByRole('link', { name: 'Saltar para o conteúdo principal' })).toHaveAttribute('href', '#conteudo')
  })
})
