import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import { useAccess, useGetBooksWithStartedChapters } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'
import Modal from './Modal'
import StepSwitch from './StepSwitch'
import Down from 'public/arrow-down.svg'

function ProjectSupportCard({ project, user }) {
  const { t } = useTranslation(['books', 'common'])
  const wrapChapters = useRef([])
  const mobileBookbuttonRefs = useRef([])
  const scrollRefs = useRef({})
  const { push } = useRouter()
  const supabase = useSupabaseClient()
  const [isShowAllChapters, setIsShowAllChapters] = useState(null)
  const [currentSteps, setCurrentSteps] = useState({})
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [{ isSupporterAccess }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })
  const [books] = useGetBooksWithStartedChapters(project?.code)

  const handleScroll = (bookCode) => {
    if (scrollRefs?.current && Object.keys(scrollRefs?.current).length) {
      console.log(scrollRefs.current[bookCode]) //TODO сделать скролл к элементу
    }
  }
  const handleCloseDisclosure = (index) => {
    mobileBookbuttonRefs.current.map((closeFunction, refIndex) => {
      if (refIndex !== index) {
        closeFunction()
      }
    })
  }

  const handleGetSteps = useCallback(
    async (book, chapter) => {
      try {
        const { data } = await supabase.rpc('get_all_steps_by_chapter', {
          project_code: project.code,
          book_code: book,
          chapter_num: chapter,
        })
        setCurrentSteps(data)
        return data
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [project.code, supabase]
  )
  const openListSteps = useCallback(
    (book, chapter) => {
      const currentSteps = handleGetSteps(book, chapter)
      if (currentSteps) {
        setIsOpenModal(true)
      }
    },
    [handleGetSteps]
  )
  const toggleShowChapters = useCallback((index) => {
    setIsShowAllChapters((prev) => (prev === index ? null : index))
  }, [])
  const renderChapters = (book) => {
    return Object.keys(book.chapters).map((chapter) => {
      const chapterNum = parseInt(chapter)
      const isChapterStarted = !!book.chapters[chapter].started_at
      const isChapterFinished = !!book.chapters[chapter].finished_at
      return (
        <button
          key={chapter}
          onClick={() => openListSteps(book.code, chapterNum)}
          disabled={!isChapterStarted || isChapterFinished}
          className={`py-2 px-1 font-bold w-[12%] md:w-[10%] lg:w-[7%] xl:w-[5%] 2xl:w-[5%] text-th-secondary-10 ${
            isChapterFinished
              ? 'bg-th-secondary-400 cursor-default hover:opacity-100'
              : 'bg-th-primary-100'
          } rounded-md overflow-hidden ${
            isChapterStarted
              ? 'hover:opacity-70 cursor-pointer'
              : 'opacity-50 cursor-default'
          }`}
        >
          {chapter}
        </button>
      )
    })
  }

  return (
    <>
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => {
          setIsOpenModal(false)
          setTimeout(() => setCurrentSteps({}), 500)
        }}
        className={{
          dialogPanel:
            'p-6 w-full max-w-md align-middle transform shadow-xl transition-all bg-th-primary-100 text-th-secondary-10 rounded-3xl z-50',
        }}
      >
        <div className="flex flex-col min-h-[30vh] gap-3">
          <h1 className="mb-5 text-xl text-th-secondary-10">{t('TranslatorsList')}</h1>
          {currentSteps?.length > 0 &&
            currentSteps.map((step, step_idx) => {
              return (
                <div key={step_idx}>
                  <div
                    className="flex justify-between pl-5 items-center bg-th-secondary-10 text-th-primary-100 rounded-xl cursor-pointer"
                    onClick={() => {
                      setIsOpenModal(false)
                      push({
                        pathname:
                          'support/[project]/[book]/[chapter]/[step]/[translator]',
                        query: {
                          project: step.project,
                          book: step.book,
                          chapter: step.chapter,
                          step: step.step,
                          translator: step.login,
                        },
                      })
                    }}
                  >
                    <div>{step.login} </div>
                    <StepSwitch stepProps={step} handleGetSteps={handleGetSteps} />
                  </div>
                </div>
              )
            })}
        </div>
      </Modal>
      {isSupporterAccess && books?.length > 0 && (
        <div className="card space-y-1 bg-th-secondary-10 sm:bg-th-secondary-100">
          <Link
            href={{
              pathname: '/projects/[code]',
              query: { code: project.code },
            }}
            className="font-bold text-2xl mb-10 text-th-primary-100 hover:opacity-70"
          >
            {project.title}
          </Link>
          <div className="block sm:hidden divide-y divide-th-secondary-300">
            {books?.map((book, book_idx) => (
              <div key={book.code} className="w-full items-center justify-center">
                <Disclosure
                  as="div"
                  className="text"
                  ref={(ref) => (scrollRefs.current[book.code] = ref)}
                >
                  {({ open, close }) => (
                    <>
                      <Disclosure.Button
                        className="w-full py-2 flex gap-2 justify-between items-center"
                        ref={() => (mobileBookbuttonRefs.current[book_idx] = close)}
                        onClick={() => {
                          handleCloseDisclosure(book_idx)
                          handleScroll(book.code)
                        }}
                      >
                        <div>{t(book.code)}</div>
                        <Down
                          className={`w-5 h-5 transition-transform duration-200 ${
                            open ? 'rotate-180' : 'rotate-0'
                          } `}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="flex flex-wrap gap-2.5 text-center py-4">
                        {renderChapters(book)}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            ))}
          </div>
          <div className="hidden sm:block divide-y divide-th-secondary-300">
            {books?.map((book, book_idx) => {
              let height
              if (wrapChapters?.current?.length) {
                const parentChapters = wrapChapters?.current[book_idx]
                const parentChaptersStyle = window.getComputedStyle(parentChapters)
                height =
                  parseInt(parentChaptersStyle.getPropertyValue('padding-bottom')) +
                  parseInt(parentChaptersStyle.getPropertyValue('padding-top')) +
                  parentChapters.firstChild.offsetHeight +
                  'px'
              }
              return (
                <div key={book.code} className="flex">
                  <div className="w-2/5 md:w-1/3 lg:w-1/4 xl:w-1/5 py-4 font-bold flex items-start justify-between pr-4">
                    <span>{t(book.code)}</span>
                    {wrapChapters?.current?.[book_idx]?.lastChild.offsetTop !==
                    wrapChapters?.current?.[book_idx]?.firstChild.offsetTop ? (
                      <button onClick={() => toggleShowChapters(book_idx)}>
                        <Down
                          className={`w-6 h-6 min-w-[1.5em] ${
                            isShowAllChapters === book_idx ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>
                    ) : null}
                  </div>
                  <div
                    style={{
                      maxHeight: isShowAllChapters === book_idx ? 'none' : height,
                    }}
                    className={`flex flex-wrap gap-4 text-center py-4 w-3/5 md:w-2/3 lg:w-3/4 xl:w-4/5 font-bold overflow-hidden`}
                    ref={(el) => (wrapChapters.current[book_idx] = el)}
                  >
                    {renderChapters(book)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default ProjectSupportCard
