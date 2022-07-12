import { createContext, useState } from 'react'

export const AppContext = createContext()

export function AppContextProvider({ children }) {
  const [introductionStep, setIntroductionStep] = useState('')

  const value = {
    state: { introductionStep },
    actions: { setIntroductionStep },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
