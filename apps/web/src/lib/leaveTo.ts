/**
 * Loads another page in full, leaving the app: what the server sends the browser to after
 * signing out. Its own module, so the tests can see where the app goes without jsdom navigating.
 */
export function leaveTo(url: string) {
  window.location.assign(url)
}
