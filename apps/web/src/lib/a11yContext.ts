import { createContext, useContext } from 'react'
import { defaultA11y, type A11ySettings } from './a11y'

type A11yContextValue = {
  settings: A11ySettings
  update: (patch: Partial<A11ySettings>) => void
  reset: () => void
}

export const A11yContext = createContext<A11yContextValue>({
  settings: defaultA11y,
  update: () => {},
  reset: () => {},
})

export const useA11y = () => useContext(A11yContext)
