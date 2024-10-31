import { useState } from 'react'

import Image from 'next/image'

import LeftArrow from 'public/icons/arrow-left.svg'
import Close from 'public/icons/close.svg'
import HowItWorkImage1 from 'public/how-it-work/how-it-work-01.webp'
import HowItWorkImage2 from 'public/how-it-work/how-it-work-02.webp'
import HowItWorkImage3 from 'public/how-it-work/how-it-work-03.webp'
import HowItWorkImage4 from 'public/how-it-work/how-it-work-04.webp'
import HowItWorkImage5 from 'public/how-it-work/how-it-work-05.webp'
import HowItWorkImage6 from 'public/how-it-work/how-it-work-06.webp'

import ProgressBar from 'components/ProgressBar'

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
    <div className="relative flex w-full flex-col gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('MainBlocks.HowItWorks')}</p>
      <Close
        className={`absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
      />
      <div className="overflow-auto pr-5" onClick={(e) => e.stopPropagation()}>
        <p
          className={`text-sm font-normal transition-opacity duration-700 md:text-base ${
            opacity || ''
          }`}
        >
          {t('MainBlocks.HowItWorksText')}
        </p>
        <div className="relative mt-6 pb-6 md:mt-12 md:pb-0">
          <p>{t('MainBlocks.Screenshots')}</p>

          <div className="relative">
            <button onClick={prevPage} className="arrow-how-it-work left-0">
              <LeftArrow className="w-3 stroke-th-secondary-10" />
            </button>
            <Image
              src={imagePath}
              alt={`how it work image ${image}`}
              className="mb-5 mt-7"
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
