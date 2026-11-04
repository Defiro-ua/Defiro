import type { DocContent } from '../domain/types'

/**
 * A one-page PDF of a document (Helvetica, WinAnsi), built by hand so the
 * prototype can offer a real file to download without a library.
 */
export function pdfBlob(doc: DocContent): Blob {
  const latin = (s: string) =>
    String(s ?? '')
      .replace(/€/g, '\x80')
      .replace(/–/g, '\x96')
      .replace(/—/g, '\x97')
      .replace(/•/g, '\x95')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[\u0100-\uffff]/g, '?')
  const esc = (s: string) => latin(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  const ops: string[] = []
  let y = 780
  const text = (x: number, size: number, bold: boolean, s: string) => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${esc(s)}) Tj ET`)
  }
  const rule = () => ops.push(`0.85 0.83 0.78 RG 1 w 56 ${y} m 539 ${y} l S`)

  text(56, 10, false, 'defiro')
  y -= 40
  text(56, 22, true, doc.titulo || 'Documento')
  y -= 22
  text(56, 11, false, doc.sub || '')
  y -= 18
  rule()
  y -= 28
  for (const [label, value] of doc.linhas) {
    text(56, 10, false, label)
    text(230, 11, true, value)
    y -= 24
  }
  y -= 12
  rule()
  y -= 22
  let line = ''
  for (const w of String(doc.nota || '').split(' ')) {
    if ((line + ' ' + w).length > 92) {
      text(56, 9, false, line)
      y -= 14
      line = w
    } else line = line ? line + ' ' + w : w
  }
  if (line) {
    text(56, 9, false, line)
    y -= 14
  }
  text(56, 8, false, 'Gerado pela defiro · ' + new Date().toLocaleDateString('pt-PT'))

  const content = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  const bytes = new Uint8Array(out.length)
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255
  return new Blob([bytes], { type: 'application/pdf' })
}
