import { useEffect, useState } from 'react'

export default function ProgressBar({ amountSteps, currentStep }) {
  const [steps, setStep] = useState([])

  useEffect(() => {
    let steps = []

    for (const step = 0; step < amountSteps; step++) {
      const circle = (
        <div key={step} className="flex items-center justify-center">
          <div
            className={`step ${step < currentStep - 1 ? 'passed' : ''} ${
              step == currentStep - 1 ? 'active' : ''
            }`}
          ></div>
          <div
            className={`dash ${step < currentStep - 1 ? 'active' : ''} ${
              step == amountSteps - 1 ? 'hidden' : ''
            }`}
          ></div>
        </div>
      )
      steps.push(circle)
    }
    setStep(steps)
  }, [amountSteps, currentStep])

  return (
    <>
      <div className="relative flex items-center justify-center">
        <p className="mr-2 mb-1 text-2xl ">
          {currentStep}/{amountSteps}:
        </p>
        {steps}
      </div>
    </>
  )
}
