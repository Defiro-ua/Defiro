import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('names the application', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'defiro' })).toBeInTheDocument()
  })

  it('is one main landmark, so screen readers can jump to it', () => {
    render(<App />)

    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })
})
