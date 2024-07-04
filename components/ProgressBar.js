export default function ProgressBar({ amountSteps, currentStep, isStartPage }) {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          {[...Array(amountSteps).keys()].map((step) => {
            return (
              <div
                key={step}
                className={`inline-block m-px rounded-full ${
                  step === currentStep - 1
                    ? isStartPage
                      ? 'w-2.5 h-2.5 bg-th-primary-100'
                      : 'w-4 h-4 bg-th-primary-100'
                    : isStartPage
                    ? 'w-1.5 h-1.5 bg-th-secondary-100'
                    : 'w-2.5 h-2.5 bg-th-secondary-10'
                }`}
              ></div>
            )
          })}
        </div>
        {!isStartPage && (
          <p className="mr-1 mb-0.5 text-xs">
            {currentStep}/{amountSteps}
          </p>
        )}
      </div>
    </>
  )
}
