import { useState } from 'react'
import Image from 'next/image'

import ProgressBar from 'components/ProgressBar'

import LeftArrow from 'public/arrow-left.svg'
import Close from 'public/close.svg'
import HowItWorkImage1 from 'public/how-it-work-01.png'
import HowItWorkImage2 from 'public/how-it-work-02.png'
import HowItWorkImage3 from 'public/how-it-work-03.png'
import HowItWorkImage4 from 'public/how-it-work-04.png'
import HowItWorkImage5 from 'public/how-it-work-05.png'
import HowItWorkImage6 from 'public/how-it-work-06.png'

function HowItWorks({ t, opacity }) {
  const [image, setImage] = useState(1)

  const prevPage = () => {
    setImage((prev) => {
      return prev === 1 ? 6 : prev - 1
    })
  }

  const nextPage = () => {
    setImage((prev) => {
      return prev === 6 ? 1 : prev + 1
    })
  }

  const images = [
    null,
    HowItWorkImage1,
    HowItWorkImage2,
    HowItWorkImage3,
    HowItWorkImage4,
    HowItWorkImage5,
    HowItWorkImage6,
  ]

  const imagePath = images[image]

  return (
    <div className="relative flex flex-col w-full gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('MainBlocks.HowItWorks')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 top-0 stroke-black cursor-pointer`}
      />
      <div className="overflow-auto pr-5" onClick={(e) => e.stopPropagation()}>
        <p
          className={`text-sm md:text-base font-normal transition-opacity duration-700 ${
            opacity || ''
          }`}
        >
          {t('MainBlocks.HowItWorksText')}
        </p>
        <div className="mt-6 md:mt-12 pb-6 md:pb-0 relative">
          <p>{t('MainBlocks.Screenshots')}</p>

          <div className="relative">
            <button onClick={prevPage} className="arrow-how-it-work left-0">
              <LeftArrow className="w-3 stroke-th-secondary-10" />
            </button>
            <Image
              src={imagePath}
              alt={`how it work image ${image}`}
              className="mt-7 mb-5"
            />
            <button onClick={nextPage} className="arrow-how-it-work right-0">
              <LeftArrow className="w-3 rotate-180 stroke-th-secondary-10" />
            </button>
          </div>

          <ProgressBar amountSteps={6} currentStep={image} isStartPage="true" />
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
