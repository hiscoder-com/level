import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'

import Link from 'next/link'

import ProjectParticipants from './ProjectParticipants'
import VerseDistributionButtons from './VerseDistributionButtons'
import ChapterProgressControls from './ChapterProgressControls'

import Plus from 'public/plus.svg'
import Gear from 'public/gear.svg'

function ChapterMobileMenu({
  assign,
  chapterProps,
  versesDivided,
  translatorsProps,
  isNotAllVersesDivided,
  setVersesDivided,
  choosedVerses,
  reset,
  t,
}) {
  const {
    mutateChapter,
    isLoading,
    supabase,
    chapter,
    verses,
    project,
    isValidating,
    mutateChapters,
    isChapterStarted,
    setIsChapterStarted,
  } = chapterProps

  const {
    translators,
    currentTranslator,
    translatorsSelecting,
    setCurrentTranslator,
    assignedTranslatorsIds,
    assignedVerseTranslators,
  } = translatorsProps

  return (
    <Menu>
      {({ open }) => (
        <>
          <div
            className={`inset-0 bg-zink-500 bg-opacity-10 backdrop-blur backdrop-filter ${
              open ? 'fixed' : 'hidden'
            } `}
          ></div>
          <Menu.Button
            className={`fixed sm:hidden p-4 translate-y-1/2 ${
              open ? 'bottom-[80vh]' : 'bottom-24'
            }  right-5 z-10 rounded-full bg-th-primary-100 text-th-text-secondary-100 transition-all duration-700`}
          >
            <Plus
              className={`w-7 h-7 transition-all duration-700 ${
                open ? 'rotate-45' : 'rotate-0'
              } `}
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            show={open}
            enter="transition-all duration-700 ease-in-out transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition-all duration-700 ease-in-out transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <div
              className={`fixed bottom-0 left-0 w-full h-[80vh] overflow-y-auto rounded-t-2xl bg-th-secondary-10`}
            >
              {open && (
                <Menu.Items>
                  <div className="flex gap-2 items-center pt-6">
                    <div className="p-4 text-xl font-bold">{t('Participants')}</div>
                    <Link href={`/projects/${project?.code}/edit?setting=participants`}>
                      <Gear className="w-6 h-6 min-w-[1.5rem] stroke-th-text-primary" />
                    </Link>
                  </div>

                  <Menu.Item
                    as="div"
                    className="px-4 h-full w-full"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col gap-3 pb-3 h-full w-full">
                      {translators.length > 0 ? (
                        <div>
                          <ProjectParticipants
                            participants={translators}
                            assignedTranslatorsIds={assignedTranslatorsIds}
                            assignedVerseTranslators={assignedVerseTranslators}
                            currentTranslator={currentTranslator}
                            setCurrentTranslator={setCurrentTranslator}
                            translatorsSelecting={translatorsSelecting}
                            t={t}
                          />
                        </div>
                      ) : (
                        <>
                          {[...Array(4).keys()].map((el) => (
                            <div role="status" className="w-full animate-pulse" key={el}>
                              <div className="h-[68px] bg-th-secondary-100 rounded-2xl w-full"></div>
                            </div>
                          ))}
                        </>
                      )}
                      <VerseDistributionButtons
                        translators={translators}
                        setVersesDivided={setVersesDivided}
                        versesDivided={versesDivided}
                        isChapterStarted={isChapterStarted}
                        assignedTranslatorsIds={assignedTranslatorsIds}
                        choosedVerses={choosedVerses}
                        isNotAllVersesDivided={isNotAllVersesDivided}
                        assign={assign}
                        reset={reset}
                        translator={currentTranslator}
                        isTranslatorSelected={!!currentTranslator}
                        t={t}
                      />

                      <ChapterProgressControls
                        chapter={chapter}
                        isValidating={isValidating}
                        isLoading={isLoading}
                        verses={verses}
                        supabase={supabase}
                        project={project}
                        mutateChapter={mutateChapter}
                        mutateChapters={mutateChapters}
                        setIsChapterStarted={setIsChapterStarted}
                        t={t}
                      />
                    </div>
                  </Menu.Item>
                </Menu.Items>
              )}
            </div>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default ChapterMobileMenu
