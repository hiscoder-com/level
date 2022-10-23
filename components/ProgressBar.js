import { useEffect, useState } from 'react'

export default function ProgressBar({ amountSteps, currentStep }) {
  const [steps, setSteps] = useState([])

  useEffect(() => {
    let steps = []
    let step
    for (step = 0; step < amountSteps; step++) {
      const circle = (
        <div key={step} className="flex items-center justify-center">
          <div
            className={`step ${step < currentStep - 1 ? 'passed' : ''} ${
              step === currentStep - 1 ? 'active' : ''
            }`}
          ></div>
          <div
            className={`dash ${step < currentStep - 1 ? 'active' : ''} ${
              step === amountSteps - 1 ? 'hidden' : ''
            }`}
          ></div>
        </div>
      )
      steps.push(circle)
    }
    setSteps(steps)
  }, [amountSteps, currentStep])

  return (
    <>
      <div className="relative flex items-center justify-center">
        <p className="mr-1 mb-0.5 text-xs">
          {currentStep}/{amountSteps}:
        </p>
        {steps}
      </div>
    </>
  )
}
