import { useEffect, useState } from 'react'

export { useState } from 'react'
const countStepsNum = 7

export default function ProgressBar() {
  const [currentStepNum, setCurrentStepNum] = useState(5)
  const [currentSteps, setCurrentStep] = useState([])
  useEffect(() => {
    let steps = []

    for (const step = 0; step < countStepsNum; step++) {
      const circle = (
        <>
          <div className={`${step < currentStepNum ? 'step active' : 'step'}`}></div>
          <div
            className={`${step < currentStepNum - 1 ? 'tire tire-active ' : 'tire'} ${
              step == countStepsNum - 1 ? 'hidden' : ''
            }`}
          ></div>
        </>
      )
      steps.push(circle)
    }
    const lastStep = steps[steps.length - 1]
    console.log(lastStep)
    setCurrentStep(steps)
  }, [currentStepNum])

  return (
    <>
      <div className="progress-bar">
        <p className="mr-2 mb-1 text-2xl ">
          {currentStepNum}/{countStepsNum}:
        </p>
        {currentSteps}
      </div>
    </>
  )
}
