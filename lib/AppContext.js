import { createContext, useState } from 'react'

export const AppContext = createContext()

export function AppContextProvider({ children }) {
  const [step, setStep] = useState(1)
  const [introductionStep, setIntroductionStep] = useState(false)

  const value = {
    state: { step, introductionStep },
    actions: { setStep, setIntroductionStep },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
