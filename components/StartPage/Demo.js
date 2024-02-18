import Image from 'next/image'

import Underconstruction from 'public/underconstruction.png'

function Demo({ t }) {
  return (
    <div className="flex flex-col w-full">
      <p className="hidden md:block">{t('Demo')}</p>
      <div className="flex flex-grow flex-col items-center justify-center gap-0 md:gap-14 pb-6 md:pb-0">
        <Image src={Underconstruction} alt="Unredconstruction image" />
        <p>{t('ComingSoon')}</p>
      </div>
    </div>
  )
}

export default Demo
