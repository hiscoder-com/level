import Close from 'public/icons/close.svg'

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
        className={`overflow-hidden ${
          collapsed ? 'lg:w-0' : 'lg:w-auto'
        } cursor-pointer ${
          isOpen ? 'text-th-text-primary' : 'lg:text-th-secondary-300'
        } group-hover:text-th-text-primary ${collapsed ? 'lg:hidden' : ''}`}
      >
        <span className="whitespace-nowrap">{buttonTitle}</span>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 top-0 z-10 ml-4 flex h-[calc(100vh-40px)] min-h-full w-full cursor-default flex-col overflow-auto rounded-none border-th-secondary-300 bg-th-secondary-10 pb-3 shadow-md sm:overflow-visible sm:border sm:pb-7 md:left-full md:h-min md:max-h-full md:overflow-hidden md:rounded-xl lg:ml-0 lg:w-[30rem] lg:rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-center bg-th-secondary-400 py-4 lg:px-7">
            <p className="text-lg font-medium text-th-text-secondary-100">{modalTitle}</p>
            <button className="absolute right-4" onClick={() => setIsOpen(false)}>
              <Close className="h-8 stroke-th-secondary-10" />
            </button>
          </div>
          <div className="h-full overflow-y-auto overflow-x-hidden p-4 lg:px-7">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default ModalInSideBar
