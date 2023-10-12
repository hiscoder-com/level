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
                className={`inline-block m-px rounded-full ${
                  step === currentStep - 1
                    ? 'w-4 h-4 bg-th-primary'
                    : 'w-2.5 h-2.5 bg-th-secondary-background'
                }`}
              ></div>
            )
          })}
        </div>
      </div>
    </>
  )
}
