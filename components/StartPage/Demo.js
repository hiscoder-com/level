import Image from 'next/image'

import Underconstruction from 'public/underconstruction.png'
import Close from 'public/close.svg'

function Demo({ t }) {
  return (
    <div className="relative flex flex-col w-full">
      <p className="hidden md:block">{t('Demo')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 -top-7 stroke-black cursor-pointer`}
      />
      <div className="flex flex-grow flex-col items-center justify-center gap-0 md:gap-14 pb-6 md:pb-0">
        <Image src={Underconstruction} alt="Unredconstruction image" />
        <p>{t('ComingSoon')}</p>
      </div>
    </div>
  )
}

export default Demo
