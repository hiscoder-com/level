export default function ProgressBar({ amountSteps, currentStep }) {
  return (
    <>
      <div className="relative flex items-center justify-center">
        <p className="mr-1 mb-0.5 text-xs">
          {currentStep}/{amountSteps}:
        </p>
        <div className="flex items-center gap-1">
          {[...Array(amountSteps).keys()].map((step) => {
            return (
              <div
                key={step}
                className={`step ${step === currentStep - 1 ? 'active' : ''}`}
              ></div>
            )
          })}
        </div>
      </div>
    </>
  )
}
