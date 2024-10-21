import Close from 'public/close.svg'

function ModalInSideBar({
  isOpen,
  setIsOpen,
  children,
  modalTitle,
  buttonTitle,
  collapsed,
}) {
  return (
    <>
      <div
        className={`cursor-pointer text-th-text-primary hover:opacity-70 ${
          collapsed ? 'lg:hidden' : ''
        }`}
      >
        {buttonTitle}
      </div>

      {isOpen && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-[calc(100vh-40px)] min-h-full bg-th-secondary-10 z-10 md:h-min ml-4 lg:ml-0 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md border-th-secondary-300 sm:border md:max-h-full md:left-full lg:w-[30rem] rounded-none md:rounded-xl lg:rounded-none md:overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-center py-4 bg-th-secondary-400 lg:px-7">
            <p className="text-th-text-secondary-100 font-medium text-lg">{modalTitle}</p>
            <button className="absolute right-4" onClick={() => setIsOpen(false)}>
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
