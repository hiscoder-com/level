import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useRecoilState } from 'recoil'

import Modal from './Modal'
import { aboutVersionModalIsOpen } from './state/atoms'

import packageJson from '../package.json'

import updatesEN from '../public/updateVersionInfo/updates_en.md'
import updatesRU from '../public/updateVersionInfo/updates_ru.md'
import updatesES from '../public/updateVersionInfo/updates_es.md'

import Close from 'public/close.svg'

function AboutVersion({
  isMobileIndexPage = false,
  isSidebar = false,
  isStartPage = false,
  setShowUpdates = () => {},
}) {
  const aboutVersion = {
    en: updatesEN,
    ru: updatesRU,
    es: updatesES,
  }
  const { locale } = useRouter()
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [versionModalIsOpen, setVersionModalIsOpen] = useRecoilState(
    aboutVersionModalIsOpen
  )
  useEffect(() => {
    if (!versionModalIsOpen || !isOpen) {
      setShowAllUpdates(false)
    }
  }, [isOpen, versionModalIsOpen])

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
      <div className="flex flex-col w-full lg:h-full">
        <div className="sticky top-0 py-6 md:py-0 md:static flex items-center justify-between bg-th-secondary-10">
          <p>
            {t('Version')} {packageJson.version}
          </p>
          <Close
            className="block lg:hidden h-8 stroke-th-primary-100"
            onClick={(e) => {
              e.stopPropagation()
              setShowUpdates(false)
            }}
          />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ReactMarkdown className="flex-grow md:mt-5 text-left overflow-y-auto text-sm font-normal whitespace-pre-line leading-5">
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
          <div className="mt-auto flex justify-center py-4 lg:py-0 lg:pt-4">
            <button
              onClick={() => setShowAllUpdates((prev) => !prev)}
              className="btn-primary"
            >
              {showAllUpdates ? t('ShowCurrUpdates') : t('ShowAllUpdates')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`hover:opacity-70 ${isMobileIndexPage ? 'ml-4' : ''} ${
          !isSidebar ? 'text-xs cursor-pointer text-th-text-primary' : ''
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
            className="absolute flex flex-col right-0 top-0 w-full h-full min-h-full bg-white z-10 md:h-min px-3 sm:px-7 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between py-6 bg-th-secondary-10">
              <p className="text-left text-2xl font-bold">
                {t('Version')} {packageJson.version}
              </p>
              <button className="text-right" onClick={() => setVersionModalIsOpen(false)}>
                <Close className="h-8 stroke-th-primary-100" />
              </button>
            </div>
            <ReactMarkdown className="flex-grow pb-5 pr-3 whitespace-pre-line leading-5 sm:max-h-full sm:overflow-auto">
              {showAllUpdates ? fullAboutVersion : currentAboutVersion}
            </ReactMarkdown>
            <div className="mt-auto flex justify-center pt-5 border-t border-th-secondary-300">
              <button
                onClick={() => setShowAllUpdates((prev) => !prev)}
                className={`${isMobileIndexPage ? 'btn-secondary' : 'btn-primary'}`}
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
          className={{
            dialogPanel: `w-full align-middle transform overflow-y-auto shadow-xl transition-all ${
              isMobileIndexPage
                ? 'px-6 pb-6 bg-th-secondary-10 text-th-text-primary h-screen w-screen'
                : 'flex flex-col h-full max-h-[80vh] max-w-lg px-6 pb-6 rounded-3xl bg-th-primary-100 text-th-text-secondary-100'
            }`,
            main: `z-50 ${isMobileIndexPage ? 'fixed flex inset-0' : 'relative'}`,
            transitionChild: `inset-0 opacity-25 bg-th-secondary-100 ${
              isMobileIndexPage ? 'absolute' : 'fixed'
            }`,
            backdrop: `inset-0 ${
              isMobileIndexPage ? 'relative' : 'fixed overflow-y-auto backdrop-blur'
            }`,
            content: `${
              !isMobileIndexPage && 'flex items-center justify-center p-4 min-h-full'
            }`,
          }}
          isChangelog={!isMobileIndexPage}
        >
          <div
            className={`sticky top-0 flex items-center justify-between py-6 ${
              isMobileIndexPage ? 'bg-th-secondary-10' : 'bg-th-primary-100'
            }`}
          >
            <p className="text-2xl font-bold text-left">
              {t('Version')} {packageJson.version}
            </p>
            <button className="text-right" onClick={() => setIsOpen(false)}>
              <Close
                className={`h-8 ${
                  isMobileIndexPage
                    ? 'stroke-th-text-primary'
                    : 'stroke-th-text-secondary-100'
                }`}
              />
            </button>
          </div>

          <ReactMarkdown
            className={`pr-3 whitespace-pre-line leading-5 ${
              !isMobileIndexPage ? 'max-h-full mb-4 overflow-auto' : ''
            }`}
          >
            {showAllUpdates ? fullAboutVersion : currentAboutVersion}
          </ReactMarkdown>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAllUpdates((prev) => !prev)}
              className={`${isMobileIndexPage ? 'btn-primary' : 'btn-secondary'}`}
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
