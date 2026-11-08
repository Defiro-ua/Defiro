import { describe, expect, it } from 'vitest'
import { allowance, dateConflict, eur, maskIban, maskNif, tripDays, validateTrip } from './trip'
import type { TripData } from './types'

const trip = { partida: '2026-10-12T08:00', regresso: '2026-10-14T18:00' }

/** A complete trip in October 2026, well inside the dates the form allows */
const validTrip: TripData = {
  motivo: 'Formação',
  destino: 'Lisboa',
  desc: '',
  ...trip,
  certIni: '2026-10-12',
  certFim: '2026-10-14',
  transporte: 'Comboio',
  nif: '123456789',
  iban: 'PT50000201231234567890154',
}

describe('tripDays', () => {
  it('counts the first and the last day', () => {
    expect(tripDays(trip)).toBe(3)
  })

  it('counts a same-day trip as one day', () => {
    expect(tripDays({ partida: '2026-10-12T08:00', regresso: '2026-10-12T18:00' })).toBe(1)
  })

  it('counts no days when the return is before the departure', () => {
    expect(tripDays({ partida: '2026-10-14T08:00', regresso: '2026-10-12T18:00' })).toBe(0)
  })
})

describe('allowance', () => {
  it('pays the daily allowance for each day of the trip', () => {
    expect(allowance(trip)).toBeCloseTo(142.95)
  })
})

describe('eur', () => {
  it('groups thousands with a space and uses a decimal comma', () => {
    expect(eur(1234.5)).toBe('1 234,50 €')
  })
})

describe('dateConflict', () => {
  it('finds no conflict when the certificate matches the trip', () => {
    expect(dateConflict({ ...trip, certIni: '2026-10-12', certFim: '2026-10-14' })).toBe('')
  })

  it('cannot tell while the certificate has no end date', () => {
    expect(dateConflict({ ...trip, certIni: '2026-10-12' })).toBeNull()
  })

  it('names both periods when the certificate starts on another day', () => {
    const conflict = dateConflict({ ...trip, certIni: '2026-10-13', certFim: '2026-10-14' })
    expect(conflict).toContain('13/10/2026')
    expect(conflict).toContain('12/10/2026')
  })
})

describe('masks', () => {
  it('groups the NIF in threes', () => {
    expect(maskNif('123456789')).toBe('123 456 789')
  })

  it('groups the IBAN in fours, in capitals', () => {
    expect(maskIban('pt50000201231234567890154')).toBe('PT50 0002 0123 1234 5678 9015 4')
  })
})

describe('validateTrip', () => {
  it('refuses a NIF without 9 digits', () => {
    expect(validateTrip({ ...validTrip, nif: '12345678' }, [], null)).toContainEqual({ id: 'campo-nif', txt: 'O NIF tem 9 algarismos.' })
  })

  it('refuses an IBAN that does not start with PT50', () => {
    expect(validateTrip({ ...validTrip, iban: 'PT51000201231234567890154' }, [], null)).toContainEqual({
      id: 'campo-iban',
      txt: 'O IBAN português começa por PT50 e tem 25 caracteres.',
    })
  })
})
