import VCanaIntro from 'public/v-cana-intro.svg'
import Close from 'public/close.svg'

function VcanaIntro({ t, opacity }) {
  return (
    <div className="flex flex-col w-full">
      <p
        className="font-semibold md:font-bold"
        dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsVcana') }}
      ></p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 top-0 stroke-black cursor-pointer`}
      />
      <p
        className={`mt-6 md:mt-12 text-sm md:text-base font-normal transition-opacity duration-700 ${
          opacity || ''
        }`}
      >
        {t('MainBlocks.VcanaText')}
      </p>
      <div className="flex flex-grow flex-col justify-center items-center pb-6 md:pb-0">
        <VCanaIntro className="w-full" />
      </div>
    </div>
  )
}
export default VcanaIntro
