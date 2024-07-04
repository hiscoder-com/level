import { useTranslation } from 'next-i18next'

import Close from 'public/close.svg'

function ModalInSideBar({ isOpen, setIsOpen, children }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="cursor-pointer text-th-text-primary hover:opacity-70">
        {t('personalNotes')}
      </div>

      {isOpen && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-full min-h-full bg-th-secondary-10 z-10 md:h-min px-3 sm:px-7 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-end py-6 bg-th-secondary-10">
            <button className="text-right" onClick={() => setIsOpen(false)}>
              <Close className="h-8 stroke-th-primary-100" />
            </button>
          </div>
          <div className="h-full overflow-x-hidden overflow-y-auto p-4">{children}</div>
        </div>
      )}
    </>
  )
}

export default ModalInSideBar
