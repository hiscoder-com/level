import { useEffect, useState } from 'react'

import ProgressBar from './ProgressBar'

import LeftArrow from 'public/arrow-left.svg'

function HowItWork({ t, opacity }) {
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

  const imagePath = `/how-it-work-0${image}.png`

  const preloadImages = (images) => {
    images.forEach((image) => {
      const img = new Image()
      img.src = image
    })
  }

  useEffect(() => {
    const imagePaths = [
      '/how-it-work-01.png',
      '/how-it-work-02.png',
      '/how-it-work-03.png',
      '/how-it-work-04.png',
      '/how-it-work-05.png',
      '/how-it-work-06.png',
    ]
    preloadImages(imagePaths)
  }, [])

  return (
    <div className="flex flex-col w-full gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('MainBlocks.HowItWork')}</p>
      <div className="overflow-auto pr-5" onClick={(e) => e.stopPropagation()}>
        <p
          className={`text-sm md:text-base font-normal transition-opacity duration-700 ${
            opacity || ''
          }`}
        >
          {t('MainBlocks.HowItWorkText')}
        </p>
        <div className="mt-6 md:mt-12 pb-6 relative">
          <p>{t('MainBlocks.Screenshots')}</p>

          <div className="relative">
            <button onClick={prevPage} className="arrow-how-it-work left-0">
              <LeftArrow className="w-3 stroke-th-secondary-10" />
            </button>
            <img
              src={imagePath}
              alt={`how it work image ${image}`}
              className="w-full h-auto mt-7 mb-5"
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

export default HowItWork
