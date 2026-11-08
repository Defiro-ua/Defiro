import { describe, expect, it } from 'vitest'
import { canStart, totalDays, workflowAC } from './workflows'

/** «Ajudas de custo» with its first step handled by another group */
function startedBy(quem: string) {
  const wf = workflowAC()
  wf.passos[0] = { ...wf.passos[0], quem }
  return wf
}

describe('canStart', () => {
  it('lets every worker start «Ajudas de custo»', () => {
    expect(canStart(workflowAC(), 'ana')).toBe(true)
  })

  it('refuses someone outside the group of the first step', () => {
    expect(canStart(startedBy('Divisão Financeira'), 'ana')).toBe(false)
  })

  it('lets a member of the group of the first step start it', () => {
    expect(canStart(startedBy('Divisão Financeira'), 'carla')).toBe(true)
  })
})

describe('totalDays', () => {
  it('adds up the deadlines of the review steps', () => {
    expect(totalDays(workflowAC())).toBe(23)
  })
})
