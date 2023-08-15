import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import Modal from './Modal'

import updateData from '../update_en.md'
import packageJson from '../package.json'

import Close from 'public/close.svg'
import { useRecoilState } from 'recoil'
import { versionModalState } from './Panel/state/atoms'

function AboutVersion({ isMobileIndexPage = false, isSidebar = false }) {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [versionModalIsOpen, setVersionModalIsOpen] = useRecoilState(versionModalState)

  const VersionInfo = () => {
    const currentVersion = packageJson.version
    let matchedTexts

    if (showAllUpdates) {
      matchedTexts = [updateData]
    } else {
      const regex = new RegExp(
        `# Version ${currentVersion}([\\s\\S]*?)(?=# Version|$)`,
        'g'
      )
      matchedTexts = updateData.match(regex)
    }

    if (matchedTexts && matchedTexts.length > 0) {
      let processedText = matchedTexts[0].replace(
        /^### (.+)/gm,
        (title) => `${title.toUpperCase()}`
      )
      processedText = processedText
        .replace(/^-\s+/gm, '∙ ')
        .replace(/# Version (\d+\.\d+\.\d+)/g, (_, version) =>
          version === currentVersion ? '' : `# **Version ${version}**`
        )
      console.log(processedText)
      return processedText
    }
    return ''
  }

  return (
    <>
      <div
        className={`${isMobileIndexPage && 'ml-4'} ${
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
              <button
                className="text-right"
                onClick={() => {
                  setShowAllUpdates(false)
                  setVersionModalIsOpen(false)
                }}
              >
                <Close className="h-8 stroke-slate-500" />
              </button>
            </div>
            <ReactMarkdown className="whitespace-pre-line leading-5">
              {VersionInfo()}
            </ReactMarkdown>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                className={`${isMobileIndexPage ? 'btn-slate' : 'btn-secondary'}`}
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
          additionalClasses={`${isMobileIndexPage ? 'h-screen w-screen' : ''}`}
          isMobileChangelog={isMobileIndexPage}
        >
          <div
            className={`flex items-center justify-between mb-7 ${
              isMobileIndexPage && 'sticky top-0 py-6 bg-white'
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
              className={`${isMobileIndexPage ? 'btn-slate' : 'btn-secondary'}`}
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
