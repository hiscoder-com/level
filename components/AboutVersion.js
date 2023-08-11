import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import emojiDictionary from 'emoji-dictionary'
import ReactMarkdown from 'react-markdown'

import Modal from './Modal'

import changelogData from '../CHANGELOG.md'
import packageJson from '../package.json'

import Close from 'public/close.svg'

function AboutVersion({
  isMobile = false,
  isSidebar = false,
  isVersionModalOpen,
  setIsVersionModalOpen,
}) {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)

  const [showAllUpdates, setShowAllUpdates] = useState(false)

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
        className={`cursor-pointer ${isMobile ? 'l-4' : ''} ${
          isSidebar ? '' : 'text-xs text-[#909090]'
        }`}
        onClick={() => {
          !isSidebar && setIsOpen(true)
        }}
      >
        {t('Version')} {packageJson.version}
      </div>

      {isSidebar ? (
        isVersionModalOpen && (
          <div
            className="absolute w-full h-full left-full px-3 pb-3 ml-5 top-0 overflow-y-auto border rounded-2xl border-gray-350 shadow-md bg-white sm:px-7 sm:pb-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex justify-between items-center mb-7 sticky top-0 py-6 bg-white`}
            >
              <p className="text-2xl font-bold text-left">
                {t('Version')} {packageJson.version}
              </p>
              <button className="text-right" onClick={() => setIsVersionModalOpen(false)}>
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
            className={`flex justify-between items-center mb-7 ${
              isMobile ? 'sticky top-0 py-6 bg-white' : ''
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
