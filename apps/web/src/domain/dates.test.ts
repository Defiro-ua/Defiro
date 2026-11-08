import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dateFromText, dateMessage, deadline, maskDate, timeOk } from './dates'

describe('dateFromText', () => {
  it('turns dd/mm/aaaa into an ISO date', () => {
    expect(dateFromText('12/10/2026')).toBe('2026-10-12')
  })

  it('refuses a day that does not exist', () => {
    expect(dateFromText('31/02/2026')).toBe('')
  })

  it('refuses an ISO date typed as text', () => {
    expect(dateFromText('2026-10-12')).toBe('')
  })
})

describe('dateMessage', () => {
  it('says when a well-written date does not exist', () => {
    expect(dateMessage('31/02/2026')).toBe('Esta data não existe. Confirme o dia e o mês.')
  })

  it('explains the format when the date is written another way', () => {
    expect(dateMessage('12-10-2026')).toBe('Escreva a data com dia, mês e ano: dd/mm/aaaa, por exemplo 12/10/2026.')
  })
})

describe('timeOk', () => {
  it('accepts the last minute of the day', () => {
    expect(timeOk('23:59')).toBe(true)
  })

  it('refuses hour 24', () => {
    expect(timeOk('24:00')).toBe(false)
  })

  it('refuses minute 60', () => {
    expect(timeOk('08:60')).toBe(false)
  })
})

describe('maskDate', () => {
  it('adds the slashes while typing', () => {
    expect(maskDate('12102026')).toBe('12/10/2026')
  })
})

describe('deadline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 7, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ends today', () => {
    expect(deadline('2026-11-07')).toEqual({ txt: 'Termina hoje', p: 'perto' })
  })

  it('is one day late', () => {
    expect(deadline('2026-11-06')).toEqual({ txt: 'Atrasado 1 dia', p: 'atraso' })
  })

  it('is close with three days left', () => {
    expect(deadline('2026-11-10')).toEqual({ txt: 'Faltam 3 dias', p: 'perto' })
  })

  it('is on time with four days left', () => {
    expect(deadline('2026-11-11')).toEqual({ txt: 'Faltam 4 dias', p: 'ok' })
  })
})
