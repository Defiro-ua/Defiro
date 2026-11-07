/*
 * Dates are kept as ISO text: «2026-10-12» or «2026-10-12T08:30». People type
 * them as dd/mm/aaaa and hh:mm; the ISO value only exists once the text is a
 * real date.
 */

export const p2 = (n: number) => String(n).padStart(2, '0')

/** A day relative to today, at a given time */
export function day(offset = 0, h = 0, m = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(h, m, 0, 0)
  return d
}

export const isoDate = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
export const isoDateTime = (d: Date) => `${isoDate(d)}T${p2(d.getHours())}:${p2(d.getMinutes())}`
export const now = () => isoDateTime(new Date())

/** 12/10/2026 */
export function fmtDate(iso?: string) {
  if (!iso) return ''
  const p = String(iso).slice(0, 10).split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(iso)
}

/** 12/10/2026 08:30 */
export function fmtDateTime(iso?: string) {
  if (!iso) return ''
  const s = String(iso)
  return fmtDate(s) + (s.length > 10 ? ' ' + s.slice(11, 16) : '')
}

/** 12/10 · 08:30 */
export function fmtShort(iso?: string) {
  if (!iso) return ''
  const s = String(iso)
  return s.slice(8, 10) + '/' + s.slice(5, 7) + (s.length > 10 ? ' · ' + s.slice(11, 16) : '')
}

/** Adds the slashes while typing: 12102026 → 12/10/2026 */
export function maskDate(v: string) {
  const n = String(v || '').replace(/\D/g, '').slice(0, 8)
  return n.slice(0, 2) + (n.length > 2 ? '/' + n.slice(2, 4) : '') + (n.length > 4 ? '/' + n.slice(4) : '')
}

/** Adds the colon while typing: 0830 → 08:30 */
export function maskTime(v: string) {
  const n = String(v || '').replace(/\D/g, '').slice(0, 4)
  return n.slice(0, 2) + (n.length > 2 ? ':' + n.slice(2) : '')
}

/** dd/mm/aaaa → aaaa-mm-dd, or '' when it is not a real date */
export function dateFromText(t: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(t || '').trim())
  if (!m) return ''
  const dd = +m[1]
  const mm = +m[2]
  const yy = +m[3]
  const x = new Date(yy, mm - 1, dd, 12)
  return x.getFullYear() === yy && x.getMonth() === mm - 1 && x.getDate() === dd ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

export function timeOk(t: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(t || '').trim())
  return !!m && +m[1] < 24 && +m[2] < 60
}

/** The typed text of an ISO value */
export function textOf(iso?: string) {
  const s = String(iso || '')
  return { d: s.length >= 10 ? fmtDate(s) : '', h: s.length > 10 ? s.slice(11, 16) : '' }
}

/** A date written wrongly says so, instead of just «missing» */
export function dateMessage(t: string) {
  const s = String(t || '').trim()
  if (!s || dateFromText(s)) return ''
  return /^\d{2}\/\d{2}\/\d{4}$/.test(s)
    ? 'Esta data não existe. Confirme o dia e o mês.'
    : 'Escreva a data com dia, mês e ano: dd/mm/aaaa, por exemplo 12/10/2026.'
}

export function timeMessage(t: string) {
  const s = String(t || '').trim()
  if (!s || timeOk(s)) return ''
  return 'Escreva a hora com 4 algarismos, de 00:00 a 23:59, por exemplo 08:30.'
}

export type DeadlineState = 'ok' | 'perto' | 'atraso'

/** How long is left until a deadline */
export function deadline(iso?: string): { txt: string; p: DeadlineState } {
  if (!iso) return { txt: '', p: 'ok' }
  const a = new Date(String(iso).slice(0, 10) + 'T12:00')
  const h = day(0, 12)
  const n = Math.round((a.getTime() - h.getTime()) / 86400000)
  if (n < 0) return { txt: 'Atrasado ' + -n + (n === -1 ? ' dia' : ' dias'), p: 'atraso' }
  if (n === 0) return { txt: 'Termina hoje', p: 'perto' }
  return { txt: n === 1 ? 'Falta 1 dia' : 'Faltam ' + n + ' dias', p: n <= 3 ? 'perto' : 'ok' }
}

export function greeting() {
  const h = new Date().getHours()
  return h < 13 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite'
}

/** The date limits the inputs enforce, so impossible dates cannot be picked */
export function dateLimits(d: { partida?: string; regresso?: string; certIni?: string }) {
  const max = new Date().getFullYear() + 1 + '-12-31'
  const min = '2020-01-01'
  return {
    min,
    max,
    minDT: min + 'T00:00',
    maxDT: max + 'T23:59',
    regressoMinD: d.partida ? String(d.partida).slice(0, 10) : min,
    certFimMin: d.certIni || min,
    despMin: d.partida ? String(d.partida).slice(0, 10) : min,
    despMax: d.regresso ? String(d.regresso).slice(0, 10) : max,
  }
}
