import { describe, expect, it } from 'vitest'
import { draftErrors, fieldProblem, newDraft, reduceDraft } from './designer'

/** A draft that is complete except for the second step's legal deadline */
function draftWithDeadline(prazo: string) {
  let w = newDraft()
  w = reduceDraft(w, { t: 'nome', v: 'Material' })
  w = reduceDraft(w, { t: 'passo', passo: 'n2', k: 'quem', v: 'Chefias' })
  return reduceDraft(w, { t: 'passo', passo: 'n2', k: 'prazo', v: prazo })
}

const deadlineErrors = (prazo: string) => draftErrors(draftWithDeadline(prazo)).filter((e) => e.id === 'wf-n2-prazo')

describe('fieldProblem', () => {
  it('asks for a label when the field has none', () => {
    expect(fieldProblem({ rot: '', tipo: 'Texto' })).toBe('Falta o rótulo')
  })

  it('asks for at least two options in a single choice', () => {
    expect(fieldProblem({ rot: 'Cor', tipo: 'Escolha única', opcoes: 'Azul' })).toBe('Faltam opções de resposta (pelo menos duas)')
  })

  it('accepts a single choice with two options', () => {
    expect(fieldProblem({ rot: 'Cor', tipo: 'Escolha única', opcoes: 'Azul, Verde' })).toBe('')
  })
})

describe('draftErrors: legal deadline of a review step', () => {
  it.each(['0', '91'])('refuses %s working days at once', (prazo) => {
    expect(draftErrors(draftWithDeadline(prazo))).toContainEqual(
      expect.objectContaining({
        id: 'wf-n2-prazo',
        txt: 'Passo 2 («Validação da chefia»): o prazo legal tem de ser de 1 a 90 dias úteis.',
        vivo: true,
      }),
    )
  })

  it.each(['1', '90'])('accepts %s working days', (prazo) => {
    expect(deadlineErrors(prazo)).toEqual([])
  })

  it('asks for the deadline when it is empty, without flagging it at once', () => {
    const [error] = deadlineErrors('')
    expect(error.txt.endsWith('indique o prazo legal, de 1 a 90 dias úteis.')).toBe(true)
    expect(error.vivo).toBe(false)
  })
})

describe('draftErrors: request form', () => {
  it('asks for a question when the form only has the profile fields', () => {
    const error = draftErrors(newDraft()).find((e) => e.id === 'wf-n1-campos')
    expect(error?.txt.startsWith('Formulário do pedido: ainda não tem perguntas para quem faz o pedido')).toBe(true)
  })
})
