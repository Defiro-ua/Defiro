import { act, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

it('renders the app into the page’s #root', async () => {
  document.body.innerHTML = '<div id="root"></div>'

  await act(async () => {
    await import('./main')
  })

  expect(document.getElementById('root')).toContainElement(screen.getByRole('heading', { level: 1, name: 'defiro' }))
})
