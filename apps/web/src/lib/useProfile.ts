import { useOutletContext } from 'react-router'
import type { Profile } from '../api/session'

/** The profile of who is signed in, for the screens under SignedIn */
export function useProfile() {
  return useOutletContext<Profile>()
}
