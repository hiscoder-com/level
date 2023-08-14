import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import emojiDictionary from 'emoji-dictionary'

import Modal from './Modal'

import changelogData from '../CHANGELOG.md'
import packageJson from '../package.json'

import Close from 'public/close.svg'
import { useRecoilState } from 'recoil'
import { versionModalState } from './Panel/state/atoms'

function AboutVersion({ isMobile = false, isSidebar = false }) {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)

  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [versionModalIsOpen, setVersionModalIsOpen] = useRecoilState(versionModalState)

  const VersionInfo = () => {
    const regex = /(## \[[\s\S]*?)(?=## \[|$)/g
    const currentVersion = packageJson.version
    let matchedTexts = changelogData.match(regex)

    if (!showAllUpdates) {
      matchedTexts = matchedTexts.filter((versionText) =>
        versionText.includes(`[${currentVersion}]`)
      )
    }

    const processedText = matchedTexts
      .join('\n')
      .replace(
        /:(.+?):/g,
        (match, emojiName) => emojiDictionary.getUnicode(emojiName) || match
      )
      .replace(/\(\[\w+\]\(https:\/\/github\.com\/texttree\/v-cana\/commit\/\w+\)\)/g, '')
      .replace(/^### (.+)/gm, (title) => `${title.toUpperCase()}:`)

    return processedText
  }

  return (
    <>
      <div
        className={`${isMobile && 'ml-4'} ${
          !isSidebar && 'text-xs cursor-pointer text-[#909090]'
        }`}
        onClick={() => {
          !isSidebar && setIsOpen(true)
        }}
      >
        {t('Version')} {packageJson.version}
      </div>

      {isSidebar ? (
        versionModalIsOpen && (
          <div
            className="absolute w-full h-full px-3 right-0 pb-3 top-0 overflow-y-auto border shadow-md cursor-default bg-white border-gray-350 sm:px-7 sm:pb-7 sm:rounded-2xl md:left-full md:ml-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky flex items-center justify-between mb-7 top-0 py-6 bg-white`}
            >
              <p className="text-left text-2xl font-bold">
                {t('Version')} {packageJson.version}
              </p>
              <button className="text-right" onClick={() => setVersionModalIsOpen(false)}>
                <Close className="h-8 stroke-slate-500" />
              </button>
            </div>
            <ReactMarkdown className="whitespace-pre-line leading-5">
              {VersionInfo()}
            </ReactMarkdown>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                className={`${isMobile ? 'btn-slate' : 'btn-secondary'}`}
              >
                {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
              </button>
            </div>
          </div>
        )
      ) : (
        <Modal
          isOpen={isOpen}
          closeHandle={() => setIsOpen(false)}
          additionalClasses={`${isMobile ? 'h-screen w-screen' : ''}`}
          isMobileFullScreen={isMobile}
          isChangelogUpd={isMobile}
        >
          <div
            className={`flex items-center justify-between mb-7 ${
              isMobile && 'sticky top-0 py-6 bg-white'
            }`}
          >
            <p className="text-2xl font-bold text-left">
              {t('Version')} {packageJson.version}
            </p>
            <button className="text-right" onClick={() => setIsOpen(false)}>
              <Close className="h-8 stroke-slate-500" />
            </button>
          </div>
          <ReactMarkdown className="whitespace-pre-line leading-5">
            {VersionInfo()}
          </ReactMarkdown>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAllUpdates(!showAllUpdates)}
              className={`${isMobile ? 'btn-slate' : 'btn-secondary'}`}
            >
              {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default AboutVersion
