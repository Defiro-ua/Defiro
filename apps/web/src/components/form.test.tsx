import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FileDrop } from './form'

describe('FileDrop', () => {
  // applyAccept: false, so the component's own check sees the file instead of user-event dropping it
  const user = userEvent.setup({ applyAccept: false })
  const onFiles = vi.fn()

  beforeEach(() => {
    onFiles.mockReset()
    render(
      <FileDrop label="Certificado de presença" onFiles={onFiles}>
        Arraste o ficheiro
      </FileDrop>,
    )
  })

  it('refuses a file that is not PDF, JPG or PNG', async () => {
    const input = screen.getByLabelText('Certificado de presença')

    await user.upload(input, new File(['x'], 'virus.exe'))

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível juntar: «virus.exe» não é PDF, JPG nem PNG.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('refuses a file larger than 10 MB', async () => {
    await user.upload(screen.getByLabelText('Certificado de presença'), new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf'))

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível juntar: «grande.pdf» tem mais de 10 MB.')
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('accepts a PDF', async () => {
    const file = new File(['%PDF'], 'certificado.pdf', { type: 'application/pdf' })

    await user.upload(screen.getByLabelText('Certificado de presença'), file)

    expect(onFiles).toHaveBeenCalledExactlyOnceWith([file])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
