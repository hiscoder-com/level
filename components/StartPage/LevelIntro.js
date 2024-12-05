import ReactMarkdown from 'react-markdown'

import Close from 'public/icons/close.svg'
import LevelIntroImage from 'public/main/level-intro.svg'

function LevelIntro({ t, opacity }) {
  return (
    <div className="flex w-full flex-col">
      <p
        className="font-semibold md:font-bold"
        dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsLevel') }}
      ></p>
      <Close className="absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden" />
      <div
        className={`mt-6 space-y-4 text-sm font-normal transition-opacity duration-700 md:mt-12 lg:text-base ${
          opacity || ''
        }`}
      >
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                style={{
                  color: '#007bff',
                  textDecoration: 'underline',
                }}
              >
                {children}
              </a>
            ),
          }}
        >
          {t('MainBlocks.LevelText')}
        </ReactMarkdown>
      </div>
      <div className="flex flex-grow flex-col items-center justify-center pb-6 md:mt-4 md:pb-0">
        <LevelIntroImage className="w-3/5 lg:w-2/3 xl:w-3/4" />
      </div>
    </div>
  )
}
export default LevelIntro
