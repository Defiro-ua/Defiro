/** Items of the side menu the server allows this person to see. */
export type MenuItem = 'create-workflow' | 'new-request' | 'inbox' | 'workflows'

/**
 * Who is signed in, as the server read it from Entra ID (GET /api/me). Name, unit, job title and
 * manager are null when the token does not carry them.
 */
export type Profile = {
  name: string | null
  unit: string | null
  jobTitle: string | null
  manager: string | null
  menu: MenuItem[]
}

export async function fetchProfile(): Promise<Profile | null> {
  const response = await fetch('/api/me', { credentials: 'same-origin' })
  if (response.status === 401) return null
  if (!response.ok) throw new Error(`GET /api/me answered ${response.status}`)
  return (await response.json()) as Profile
}

/**
 * Ends the session on the server. The session cookie goes with every request, so the server asks for
 * the CSRF token it left in the XSRF-TOKEN cookie, sent back in a header. Returns the page the
 * server sends the browser to: the home page, with the signed-out notice.
 */
export async function signOut(): Promise<string> {
  const response = await fetch('/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': cookie('XSRF-TOKEN') },
  })
  if (!response.ok) throw new Error(`POST /logout answered ${response.status}`)
  return response.url
}

function cookie(name: string): string {
  const prefix = `${name}=`
  const found = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  return found ? decodeURIComponent(found.slice(prefix.length)) : ''
}
