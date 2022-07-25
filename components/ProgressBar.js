import { useEffect, useState } from 'react'

export { useState } from 'react'
const countStepsNum = 7
export default function ProgressBar() {
  const [currentStepNum, setCurrentStepNum] = useState(4)
  const [currentSteps, setCurrentStep] = useState([])

  useEffect(() => {
    let steps = []

    for (const step = 0; step < countStepsNum; step++) {
      const circle = (
        <div className={`${step < currentStepNum ? '' : 'zero-activ'} zero`}>
          <div
            className={`${
              step < currentStepNum ? '' : 'progress-step-activ'
            } progress-step`}
          ></div>
        </div>
      )
      steps.push(circle)
    }
    setCurrentStep(steps)
  }, [currentStepNum])

  return (
    <>
      <div className="progress-bar">
        <p className="mr-2 mb-1 ">
          {currentStepNum}/{countStepsNum}:
        </p>
        {/* <div className="step"></div>
        <div className="step active"></div> */}
        <div className="zero">
          <div className="progress-step"></div>
        </div>
        <div className="tire"></div>

        <div className="zero">
          <div className="progress-step"></div>
        </div>
        <div className="tire"></div>
        <div className="zero">
          <div className="progress-step"></div>
        </div>
        <div className="tire"></div>
        <div className="zero">
          <div className="progress-step"></div>
        </div>
        <div className="tire tire-activ"></div>
        <div className="zero zero-activ">
          <div className="progress-step progress-step-activ"></div>
        </div>
        <div className="tire tire-activ"></div>
        <div className="zero zero-activ">
          <div className="progress-step progress-step-activ"></div>
        </div>
        <div className="tire tire-activ"></div>
        <div className="zero zero-activ">
          <div className="progress-step progress-step-activ">7</div>
        </div>
      </div>
      {/* {currentSteps} */}
    </>
  )
}
