import { Menu } from '@headlessui/react'

import Link from 'next/link'

import ProjectParticipants from './ProjectParticipants'
import VerseDistributionButtons from './VerseDistributionButtons'
import ChapterProgressControls from './ChapterProgressControls'
import MobileMenu from 'components/Panel/UI/MobileMenu'

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
    defaultColor,
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
    <MobileMenu>
      <Menu.Items>
        <div className="flex gap-2 items-center pt-6">
          <div className="p-4 text-xl font-bold">{t('Participants')}</div>
          <Link href={`/projects/${project?.code}/edit#participants`}>
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
              defaultColor={defaultColor}
              translator={currentTranslator}
              isTranslatorSelected={!!currentTranslator}
              t={t}
              isDivide={!!assignedVerseTranslators?.length}
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
    </MobileMenu>
  )
}

export default ChapterMobileMenu
