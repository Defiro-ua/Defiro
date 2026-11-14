import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchProfile, signOut, type Profile } from './session'

const ana: Profile = {
  name: 'Ana Ferreira',
  unit: 'Divisão de Obras Municipais',
  jobTitle: 'Técnica Superior',
  manager: 'Rui Matos',
  menu: ['new-request', 'inbox'],
}

function respond(status: number, body?: unknown, url = '') {
  const response = new Response(body === undefined ? null : JSON.stringify(body), { status })
  Object.defineProperty(response, 'url', { value: url })
  return response
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
})

describe('fetchProfile', () => {
  it('returns who is signed in, as the server read it from Entra ID', async () => {
    fetchMock.mockResolvedValue(respond(200, ana))

    await expect(fetchProfile()).resolves.toEqual(ana)
    expect(fetchMock).toHaveBeenCalledWith('/api/me', expect.objectContaining({ credentials: 'same-origin' }))
  })

  it('returns null when nobody is signed in', async () => {
    fetchMock.mockResolvedValue(respond(401))

    await expect(fetchProfile()).resolves.toBeNull()
  })

  it('fails on any other answer, so an outage is not mistaken for being signed out', async () => {
    fetchMock.mockResolvedValue(respond(503))

    await expect(fetchProfile()).rejects.toThrow('503')
  })
})

describe('signOut', () => {
  it('posts to /logout with the CSRF token from the cookie in a header', async () => {
    document.cookie = 'XSRF-TOKEN=token-from-the-server; path=/'
    fetchMock.mockResolvedValue(respond(200, undefined, 'http://localhost/?aviso=sessao-terminada'))

    await signOut()

    expect(fetchMock).toHaveBeenCalledWith(
      '/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-XSRF-TOKEN': 'token-from-the-server' },
      }),
    )
  })

  it('returns the page the server sends the browser to', async () => {
    document.cookie = 'XSRF-TOKEN=t; path=/'
    fetchMock.mockResolvedValue(respond(200, undefined, 'http://localhost/?aviso=sessao-terminada'))

    await expect(signOut()).resolves.toBe('http://localhost/?aviso=sessao-terminada')
  })

  it('fails when the server refuses, so the person is not told they signed out', async () => {
    document.cookie = 'XSRF-TOKEN=t; path=/'
    fetchMock.mockResolvedValue(respond(403))

    await expect(signOut()).rejects.toThrow('403')
  })
})
