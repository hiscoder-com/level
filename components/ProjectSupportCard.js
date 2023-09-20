import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { Disclosure } from '@headlessui/react'

import { useTranslation } from 'react-i18next'

import { useAccess, useGetBooks } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'

import Modal from './Modal'
import StepSwitch from './StepSwitch'

import Down from 'public/arrow-down.svg'

function ProjectSupportCard({ project, user }) {
  const { t } = useTranslation(['books', 'common'])
  const wrapChapters = useRef([])
  const { push } = useRouter()

  const supabase = useSupabaseClient()
  const [isShowAllChapters, setIsShowAllChapters] = useState(null)
  const [currentSteps, setCurrentSteps] = useState({})
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [createdChapters, setCreatedChapters] = useState([])
  const [{ isSupporterAccess }, { isLoading }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })

  const [books, { mutate: mutateBooks }] = useGetBooks({
    code: project?.code,
  })
  const reset = () => {
    setCurrentSteps({})
  }
  useEffect(() => {
    setTimeout(() => {
      if (!isOpenModal) {
        reset()
      }
    }, 500)
  }, [isOpenModal])

  useEffect(() => {
    const getData = async () => {
      if (project.id) {
        const { data, error } = await supabase
          .from('chapters')
          .select('id,num,books(code),projects!inner(id),started_at,finished_at')
          .eq('projects.id', project.id)
          .not('started_at', 'is', null)
          .is('finished_at', null)
        const _createdChapters = {}
        for (const chapter of data) {
          _createdChapters[chapter.books.code] = {
            ..._createdChapters[chapter.books.code],
            [chapter.num]: chapter.id,
          }
        }

        setCreatedChapters(_createdChapters)
      }
    }

    getData()
  }, [project.code, project.id, supabase])
  const _books = useMemo(() => {
    if (books?.length && createdChapters) {
      const _books = books.map((book) => {
        const _createdChapters = createdChapters[book.code]

        const _chapters = {}
        for (const chapter in book.chapters) {
          if (Object.hasOwnProperty.call(book.chapters, chapter)) {
            _chapters[parseInt(chapter)] = {
              id_created: _createdChapters?.[chapter] ?? null,
            }
          }
        }
        return { ...book, chapters: _chapters }
      })

      return _books
    } else {
      return books
    }
  }, [books, createdChapters])
  const handleStep = async (book, chapter) => {
    let currentStep
    supabase
      .rpc('get_all_steps_by_chapter', {
        project_code: project.code,
        book_code: book,
        chapter_num: chapter,
      })
      .then((res) => {
        currentStep = res?.data
        setCurrentSteps(res?.data)
        console.log(res.data)
      })
      .catch((err) => console.log({ err }))
    return currentStep
  }
  const openModal = (book, chapter) => {
    if (handleStep(book, chapter)) {
      setIsOpenModal(true)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => setIsOpenModal(false)}
        className={{
          dialogPanel:
            'w-full max-w-md p-6 align-middle transform shadow-xl transition-all  bg-gradient-to-r from-slate-700 to-slate-500 text-blue-250 rounded-3xl z-50',
        }}
      >
        <div className="flex flex-col min-h-[30vh] gap-3">
          <h1 className="mb-5 text-xl text-white">Список шагов и переводчиков</h1>
          {currentSteps?.length > 0 &&
            currentSteps.map((step, step_idx) => {
              return (
                <div key={step_idx}>
                  <div
                    className="flex justify-between pl-5 items-center bg-white text-slate-900 rounded-xl cursor-pointer hover:bg-teal-500 hover:text-white"
                    onClick={() =>
                      push(
                        `support/${step.project}/${step.book}/${step.chapter}/${step.step}/${step.login}`
                      )
                    }
                  >
                    <div>{step.login} </div>
                    <StepSwitch stepProps={step} handleStep={handleStep} />
                  </div>
                </div>
              )
            })}
        </div>
      </Modal>
      {isSupporterAccess && books?.length > 0 && (
        <div className="card space-y-1">
          <h1 className="font-bold text-2xl mb-10 ">{project.title}</h1>
          <div className="block sm:hidden divide-y divide-gray-400">
            {_books?.map((book) => (
              <div key={book.code} className="w-full items-center justify-center">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="w-full py-2 flex gap-2 justify-between items-center">
                        <div>{t(book.code)}</div>
                        <Down
                          className={`w-5 h-5 transition-transform duration-200 ${
                            open ? 'rotate-180' : 'rotate-0'
                          } `}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="flex flex-wrap gap-2.5 text-center py-4">
                        {Object.keys(book.chapters).map((chapter) => {
                          return (
                            <div
                              key={chapter}
                              onClick={() => openModal(book.code, chapter)}
                              className={`font-bold px-1 w-[13%] sm:w-[8%] md:w-[7%] lg:w-[5%] xl:w-[4%] 2xl:w-[3%] py-2 bg-slate-200 rounded-md   
                      ${
                        book.chapters[chapter].id_created
                          ? 'hover:bg-teal-500 hover:text-white cursor-pointer'
                          : 'opacity-40 cursor-default'
                      }
                      `}
                            >
                              {chapter}
                            </div>
                          )
                        })}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            ))}
          </div>
          <div className="hidden sm:block divide-y divide-gray-400">
            {_books?.map((book, book_indx) => {
              let height
              let isAccordeon
              if (wrapChapters?.current?.length) {
                const parentChapters = wrapChapters?.current[book_indx]
                const parentChaptersStyle = window.getComputedStyle(parentChapters)
                isAccordeon =
                  parentChapters.lastChild.offsetTop !==
                  parentChapters.firstChild.offsetTop
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
                    {isAccordeon && (
                      <button>
                        <Down
                          className={`w-6 h-6 min-w-[1.5em] ${
                            isShowAllChapters === book_indx ? 'rotate-180' : 'rotate-0'
                          }`}
                          onClick={() => {
                            if (isShowAllChapters === book_indx) {
                              setIsShowAllChapters(null)
                            } else {
                              setIsShowAllChapters(book_indx)
                            }
                          }}
                        />
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      maxHeight: isShowAllChapters !== book_indx ? height : 'none',
                    }}
                    className={`flex flex-wrap gap-4 text-center py-4 w-3/5 md:w-2/3 lg:w-3/4 xl:w-4/5 font-bold overflow-hidden`}
                    ref={(el) => (wrapChapters.current[book_indx] = el)}
                  >
                    {Object.keys(book.chapters).map((chapter, chapter_idx) => {
                      return (
                        <button
                          key={chapter}
                          onClick={() => openModal(book.code, chapter)}
                          disabled={!book.chapters[chapter].id_created}
                          className={`font-bold px-1 w-[12%] md:w-[10%] lg:w-[7%] xl:w-[5%] 2xl:w-[5%] py-2 bg-slate-200 rounded-md overflow-hidden  
                      ${
                        book.chapters[chapter].id_created
                          ? 'hover:bg-teal-500 hover:text-white cursor-pointer'
                          : 'opacity-40 cursor-default'
                      }
                      `}
                        >
                          {chapter}
                        </button>
                      )
                    })}
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
