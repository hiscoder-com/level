import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import ReactMarkdown from 'react-markdown'
import emojiDictionary from 'emoji-dictionary'

import Modal from './Modal'

import packageJson from '../package.json'
import changelogData from '../CHANGELOG.md'

import Close from 'public/close.svg'

function AboutVersion({ isOpen, setIsOpen, isMobile = false }) {
  const { t } = useTranslation('common')

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
        className={`text-xs cursor-pointer text-[#909090] ${isMobile ? 'l-4' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        {t('Version')} {packageJson.version}
      </div>

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
    </>
  )
}

export default AboutVersion
