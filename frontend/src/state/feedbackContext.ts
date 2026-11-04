import { createContext, useContext } from 'react'

/** A short confirmation at the top of the screen for small actions (a note saved, an expense added) */
export const FeedbackContext = createContext<(message: string) => void>(() => {})

export const useFeedback = () => useContext(FeedbackContext)
