import { expect, it } from 'vitest'
import { leaveTo } from './leaveTo'

it('loads the address it is given', () => {
  // jsdom only follows changes of the hash; a real browser loads any address the same way
  const address = new URL('#sessao-terminada', window.location.href).href

  leaveTo(address)

  expect(window.location.href).toBe(address)
})
