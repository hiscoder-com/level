import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useRecoilState } from 'recoil'
import { aboutVersionModalIsOpen } from './Panel/state/atoms'

import Modal from './Modal'

import updateEN from '../public/updateVersion/update_en.md'
import updateRU from '../public/updateVersion/update_ru.md'
import updateES from '../public/updateVersion/update_es.md'
import packageJson from '../package.json'

import Close from 'public/close.svg'

function AboutVersion({ isMobileIndexPage = false, isSidebar = false }) {
  const { locale } = useRouter()
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [versionModalIsOpen, setVersionModalIsOpen] = useRecoilState(
    aboutVersionModalIsOpen
  )

  const VersionInfo = () => {
    const currentVersion = packageJson.version
    const updates = {
      ru: updateRU,
      es: updateES,
    }

    const getContentByLanguage = (lang) => {
      return updates[lang] || updateEN
    }

    const getUpdateData = (updateContent, version) => {
      const regex = new RegExp(`# Version ${version}([\\s\\S]*?)(?=# Version|$)`, 'g')
      return updateContent.match(regex)
    }

    const processText = (text, version) => {
      return text
        .replace(/^### (.+)/gm, (title) => `${title}`)
        .replace(/^-\s+/gm, '∙ ')
        .replace(/# Version (\d+\.\d+\.\d+)/g, (_, v) =>
          v === version ? '' : `# **Version ${v}**`
        )
    }

    const updateData = getContentByLanguage(locale)

    let matchedTexts = showAllUpdates
      ? [updateData]
      : getUpdateData(updateData, currentVersion)

    if (matchedTexts && matchedTexts.length > 0) {
      return processText(matchedTexts[0], currentVersion)
    }

    return ''
  }

  const closeModal = () => {
    setShowAllUpdates(false)
    setIsOpen(false)
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
            className="absolute right-0 top-0 w-full h-full px-3 pb-3 overflow-y-auto cursor-default shadow-md bg-white border-gray-350 sm:border sm:px-7 sm:pb-7 sm:rounded-2xl md:max-h-full md:h-min md:left-full md:ml-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 flex items-center justify-between py-6 bg-white`}
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
            <div className="flex justify-center mt-8">
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
          closeHandle={closeModal}
          additionalClasses={`${isMobileIndexPage ? 'h-screen w-screen' : '!max-w-lg'}`}
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
            <button className="text-right" onClick={closeModal}>
              <Close className="h-8 stroke-slate-500" />
            </button>
          </div>
          <ReactMarkdown className="whitespace-pre-line leading-5">
            {VersionInfo()}
          </ReactMarkdown>
          <div className="flex justify-center mt-8">
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
