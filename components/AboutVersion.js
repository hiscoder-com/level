import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import ReactMarkdown from 'react-markdown'
import { useRecoilState } from 'recoil'

import packageJson from '../package.json'
import updatesEN from '../public/updates_en.md'
import updatesES from '../public/updates_es.md'
import updatesRU from '../public/updates_ru.md'
import { modalsSidebar } from './state/atoms'

import Close from 'public/icons/close.svg'

function AboutVersion({ isStartPage = false, collapsed, onClose }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  const currentAboutVersion = useMemo(() => {
    const content = getAboutVersionByLanguage(locale).match(/^#\s([\s\S]+?)\n#\s/g)
    return content?.length ? processText(content[0]) : ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  if (isStartPage) {
    return (
      <div className="relative flex w-full flex-col gap-6 md:gap-2.5">
        <p className="font-semibold md:font-bold">
          {t('Version')} {packageJson.version}
        </p>
        <Close
          className={`absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
          onClick={() => onClose && onClose()}
        />
        <div className="overflow-auto" onClick={(e) => e.stopPropagation()}>
          <ReactMarkdown className="flex-grow overflow-auto whitespace-pre-line text-left text-sm font-normal leading-5 md:pr-5">
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
        </div>
        <div className="mt-auto flex justify-center">
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
      <div
        className={`${collapsed && 'lg:hidden'} ${
          modalsSidebarState.aboutVersion
            ? 'text-th-text-primary'
            : 'text-th-text-primary group-hover:text-th-text-primary lg:text-th-secondary-300'
        }`}
      >
        {t('Version')} {packageJson.version}
      </div>
      {modalsSidebarState.aboutVersion && (
        <div
          className="absolute right-0 top-0 z-10 flex h-full min-h-full w-full cursor-default flex-col overflow-auto border-th-secondary-300 bg-th-secondary-10 bg-white pb-3 shadow-md sm:overflow-visible sm:border sm:pb-7 md:left-full md:ml-5 md:h-min md:max-h-full md:overflow-hidden md:rounded-xl lg:ml-0 lg:w-[30rem] lg:rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-center bg-th-secondary-400 px-7 py-4">
            <p className="text-left text-lg font-medium text-th-secondary-10">
              {t('Version')}
            </p>
            <button
              className="absolute right-4"
              onClick={() => {
                setModalsSidebarState((prev) => ({
                  ...prev,
                  aboutVersion: false,
                }))
                if (onClose) onClose()
              }}
            >
              <Close className="h-8 stroke-th-secondary-10" />
            </button>
          </div>
          <ReactMarkdown className="flex-grow whitespace-pre-line px-7 py-5 leading-5 sm:max-h-full sm:overflow-auto">
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
          <div className="mt-auto flex justify-center px-4 pt-5">
            <button
              onClick={() => setShowAllUpdates((prev) => !prev)}
              className="btn-primary w-full"
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
