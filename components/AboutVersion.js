import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useRecoilState } from 'recoil'

import { modalsSidebar } from './state/atoms'

import packageJson from '../package.json'

import updatesEN from '../public/updateVersionInfo/updates_en.md'
import updatesRU from '../public/updateVersionInfo/updates_ru.md'
import updatesES from '../public/updateVersionInfo/updates_es.md'

import Close from 'public/close.svg'

function AboutVersion({ isStartPage = false }) {
  const aboutVersion = {
    en: updatesEN,
    ru: updatesRU,
    es: updatesES,
  }
  const { locale } = useRouter()
  const { t } = useTranslation('common')
  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [modalsSidebarState, setModalsSidebarState] = useRecoilState(modalsSidebar)

  useEffect(() => {
    if (!modalsSidebarState.aboutVersion) {
      setShowAllUpdates(false)
    }
  }, [modalsSidebarState.aboutVersion])

  const processText = (text) => {
    return text.replace(/^-\s+/gm, '∙ ').replace(/^#([\s\S]+?)\n/g, '')
  }

  const getAboutVersionByLanguage = (lang) => {
    return aboutVersion[lang] || aboutVersion['en']
  }
  const fullAboutVersion = useMemo(() => {
    const content = getAboutVersionByLanguage(locale)
    return content ? processText(content) : ''
  }, [locale])

  const currentAboutVersion = useMemo(() => {
    const content = getAboutVersionByLanguage(locale).match(/^#\s([\s\S]+?)\n#\s/g)
    return content?.length ? processText(content[0]) : ''
  }, [locale])

  if (isStartPage) {
    return (
      <div className="relative flex flex-col w-full gap-6 md:gap-2.5">
        <p className="font-semibold md:font-bold">
          {t('Version')} {packageJson.version}
        </p>
        <Close
          className={`absolute md:hidden w-6 h-6 right-0 top-0 stroke-black cursor-pointer`}
        />
        <div className="overflow-auto" onClick={(e) => e.stopPropagation()}>
          <ReactMarkdown className="flex-grow text-left overflow-auto md:pr-5 text-sm font-normal whitespace-pre-line leading-5">
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
        </div>
        <div className="flex justify-center mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAllUpdates((prev) => !prev)
            }}
            className="btn-primary"
          >
            {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hover:opacity-70">
        {t('Version')} {packageJson.version}
      </div>
      {modalsSidebarState.aboutVersion && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-full min-h-full bg-white z-10 md:h-min px-3 sm:px-7 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between py-6 bg-th-secondary-10">
            <p className="text-left text-2xl font-bold">
              {t('Version')} {packageJson.version}
            </p>
            <button
              className="text-right"
              onClick={() =>
                setModalsSidebarState((prev) => ({
                  ...prev,
                  aboutVersion: false,
                }))
              }
            >
              <Close className="h-8 stroke-th-primary-100" />
            </button>
          </div>
          <ReactMarkdown className="flex-grow pb-5 pr-3 whitespace-pre-line leading-5 sm:max-h-full sm:overflow-auto">
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
          <div className="mt-auto flex justify-center pt-5 border-t border-th-secondary-300">
            <button
              onClick={() => setShowAllUpdates((prev) => !prev)}
              className="btn-primary"
            >
              {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AboutVersion
