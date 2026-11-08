import { dateLimits, fmtDate } from './dates'
import type { Expense, FileRef, TripData } from './types'

/** Daily allowance for a trip in Portugal */
export const DAILY_ALLOWANCE = 47.65

/** 1 234,50 € */
export function eur(v: number) {
  const n = Math.round((Number(v) || 0) * 100) / 100
  const p = n.toFixed(2).split('.')
  return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + p[1] + ' €'
}

/** «24,10» → 24.1 */
export function parseNumber(v: string) {
  const n = Number(String(v || '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

/** Days of the trip, counting the first and the last */
export function tripDays(d: Pick<TripData, 'partida' | 'regresso'>) {
  if (!d.partida || !d.regresso) return 0
  const a = new Date(String(d.partida).slice(0, 10) + 'T12:00')
  const b = new Date(String(d.regresso).slice(0, 10) + 'T12:00')
  const n = Math.round((b.getTime() - a.getTime()) / 86400000) + 1
  return n > 0 ? n : 0
}

export const allowance = (d: Pick<TripData, 'partida' | 'regresso'>) => tripDays(d) * DAILY_ALLOWANCE
export const expensesSum = (desp: Expense[]) => (desp || []).reduce((t, x) => t + (Number(x.valor) || 0), 0)
export const tripTotal = (d: TripData, desp: Expense[]) => allowance(d) + expensesSum(desp)

/** null: dates missing · '': the certificate matches the trip · text: what does not match */
export function dateConflict(d: Partial<TripData>): string | null {
  if (!d.partida || !d.regresso || !d.certIni || !d.certFim) return null
  const ok = String(d.partida).slice(0, 10) === d.certIni && String(d.regresso).slice(0, 10) === d.certFim
  return ok
    ? ''
    : `O certificado indica ${fmtDate(d.certIni)} a ${fmtDate(d.certFim)} e a deslocação foi de ${fmtDate(d.partida)} a ${fmtDate(d.regresso)}.`
}

/** NIF 123 456 789 and IBAN PT50 0035 0000 …: grouped while typing */
const grouped = (v: string, n: number) => v.replace(new RegExp('(.{' + n + '})(?=.)', 'g'), '$1 ')
export const maskNif = (v: string) => grouped(String(v || '').replace(/\D/g, '').slice(0, 9), 3)
export const maskIban = (v: string) =>
  grouped(
    String(v || '')
      .replace(/[^0-9a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 25),
    4,
  )

export type FormError = {
  /** id of the field the error belongs to */
  id: string
  txt: string
  /** Shown at once (an impossible value), not only after trying to continue */
  vivo?: boolean
}

/** Every problem of an «Ajudas de custo» request */
export function validateTrip(d: TripData, desp: Expense[], cert: FileRef | null): FormError[] {
  const e: FormError[] = []
  const L = dateLimits(d)
  const outside = (v: string, a: string, b: string) => !!v && (String(v) < a || String(v) > b)
  const nif = String(d.nif || '').replace(/\s/g, '')
  if (!nif) e.push({ id: 'campo-nif', txt: 'Indique o NIF.' })
  else if (!/^\d{9}$/.test(nif)) e.push({ id: 'campo-nif', txt: 'O NIF tem 9 algarismos.' })
  const iban = String(d.iban || '')
    .replace(/\s/g, '')
    .toUpperCase()
  if (!iban) e.push({ id: 'campo-iban', txt: 'Indique o IBAN.' })
  else if (!/^PT50\d{21}$/.test(iban)) e.push({ id: 'campo-iban', txt: 'O IBAN português começa por PT50 e tem 25 caracteres.' })
  if (!String(d.destino || '').trim()) e.push({ id: 'campo-destino', txt: 'Indique o destino.' })
  if (!d.partida) e.push({ id: 'campo-partida', txt: 'Indique a data e a hora de partida.' })
  else if (outside(d.partida, L.minDT, L.maxDT)) e.push({ id: 'campo-partida', txt: 'A data de partida não é possível.', vivo: true })
  if (!d.regresso) e.push({ id: 'campo-regresso', txt: 'Indique a data e a hora de regresso.' })
  else if (outside(d.regresso, L.minDT, L.maxDT)) e.push({ id: 'campo-regresso', txt: 'A data de regresso não é possível.', vivo: true })
  else if (d.partida && d.regresso <= d.partida) e.push({ id: 'campo-regresso', txt: 'O regresso tem de ser depois da partida.', vivo: true })
  if (!d.certIni) e.push({ id: 'campo-certIni', txt: 'Indique a data de início do certificado de presença.' })
  else if (outside(d.certIni, L.min, L.max)) e.push({ id: 'campo-certIni', txt: 'A data de início do certificado não é possível.', vivo: true })
  if (!d.certFim) e.push({ id: 'campo-certFim', txt: 'Indique a data de fim do certificado de presença.' })
  else if (outside(d.certFim, L.min, L.max)) e.push({ id: 'campo-certFim', txt: 'A data de fim do certificado não é possível.', vivo: true })
  else if (d.certIni && d.certFim < d.certIni)
    e.push({ id: 'campo-certFim', txt: 'O fim do certificado tem de ser igual ou depois do início.', vivo: true })
  if (!cert) e.push({ id: 'campo-certFicheiro', txt: 'Junte o ficheiro do certificado de presença.' })
  if (!d.transporte) e.push({ id: 'campo-transporte', txt: 'Escolha o transporte.' })
  // each expense needs its receipt and a date inside the trip; changing the trip dates later re-checks them
  const trip = !!(d.partida && d.regresso && d.regresso > d.partida)
  for (const x of desp || []) {
    const nome = '«' + x.tipo + (x.desc ? ' · ' + x.desc : '') + '»'
    if (!x.comp) e.push({ id: 'campo-despesas', txt: `Junte o comprovativo da despesa ${nome}.` })
    if (trip && x.data && (x.data < L.despMin || x.data > L.despMax))
      e.push({ id: 'campo-despesas', txt: `A despesa ${nome} (${fmtDate(x.data)}) está fora das datas da deslocação.`, vivo: true })
  }
  return e
}
