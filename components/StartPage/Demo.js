import Underconstruction from 'public/underconstruction.svg'
import Close from 'public/close.svg'

function Demo({ t }) {
  return (
    <div className="relative flex flex-col w-full">
      <p className="hidden md:block">{t('Demo')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 -top-7 stroke-black cursor-pointer`}
      />
      <div className="flex flex-grow flex-col items-center justify-center gap-0 md:gap-14 pb-6 md:pb-0">
        <Underconstruction className="py-8 w-full" />
        <p>{t('ComingSoon')}</p>
      </div>
    </div>
  )
}

export default Demo
