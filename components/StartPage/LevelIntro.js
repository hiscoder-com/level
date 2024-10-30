import Close from 'public/close.svg'
import LevelIntroImage from 'public/level-intro.svg'

function LevelIntro({ t, opacity }) {
  return (
    <div className="flex w-full flex-col">
      <p
        className="font-semibold md:font-bold"
        dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsLevel') }}
      ></p>
      <Close
        className={`absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
      />
      <p
        className={`mt-6 text-sm font-normal transition-opacity duration-700 md:mt-12 md:text-base ${
          opacity || ''
        }`}
      >
        {t('MainBlocks.LevelText')}
      </p>
      <div className="flex flex-grow flex-col items-center justify-center pb-6 md:pb-0">
        <LevelIntroImage className="w-full" />
      </div>
    </div>
  )
}
export default LevelIntro
