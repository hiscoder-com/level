export default function ProgressBar({ amountSteps, currentStep, isStartPage }) {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          {[...Array(amountSteps).keys()].map((step) => {
            return (
              <div
                key={step}
                className={`m-px inline-block rounded-full ${
                  step === currentStep - 1
                    ? isStartPage
                      ? 'h-2.5 w-2.5 bg-th-primary-100'
                      : 'h-4 w-4 bg-th-primary-100'
                    : isStartPage
                      ? 'h-1.5 w-1.5 bg-th-secondary-100'
                      : 'h-2.5 w-2.5 bg-th-secondary-10'
                }`}
              ></div>
            )
          })}
        </div>
        {!isStartPage && (
          <p className="mb-0.5 mr-1 text-xs">
            {currentStep}/{amountSteps}
          </p>
        )}
      </div>
    </>
  )
}
