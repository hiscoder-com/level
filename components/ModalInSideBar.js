import Close from 'public/close.svg'

function ModalInSideBar({ isOpen, setIsOpen, children, label }) {
  return (
    <>
      <div className="cursor-pointer text-th-text-primary hover:opacity-70  lg:hidden lg:group-hover:block">
        {label}
      </div>

      {isOpen && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-full min-h-full bg-th-secondary-10 z-10 md:h-min pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md border-th-secondary-300 sm:border md:max-h-full md:left-full overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-center py-4 bg-th-primary-100 lg:px-7">
            <p className="text-th-text-secondary-100 font-medium text-lg ml-auto">
              {label}
            </p>
            <button className="text-right ml-auto" onClick={() => setIsOpen(false)}>
              <Close className="h-8 stroke-th-secondary-10" />
            </button>
          </div>
          <div className="h-full overflow-x-hidden overflow-y-auto p-4 lg:px-7">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default ModalInSideBar
