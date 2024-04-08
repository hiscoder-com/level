import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import toast from 'react-hot-toast'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Card from 'components/Project/Card'
import Breadcrumbs from 'components/Breadcrumbs'
import ProjectParticipants from 'components/Project/ChapterList/ProjectParticipants'
import VerseDistributionButtons from 'components/Project/ChapterList/VerseDistributionButtons'
import ChapterProgressControls from 'components/Project/ChapterList/ChapterProgressControls'
import ChapterMobileMenu from 'components/Project/ChapterList/ChapterMobileMenu'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import {
  useGetBook,
  useGetChapter,
  useGetChapters,
  useGetVerses,
  useProject,
  useTranslators,
  useAccess,
} from 'utils/hooks'

import Plus from 'public/plus.svg'
import Minus from 'public/minus.svg'

const translatorColors = [
  {
    border: 'border-th-divide-verse1',
    bg: 'bg-th-divide-verse1',
  },
  {
    border: 'border-th-divide-verse2',
    bg: 'bg-th-divide-verse2',
  },
  {
    border: 'border-th-divide-verse3',
    bg: 'bg-th-divide-verse3',
  },
  {
    border: 'border-th-divide-verse4',
    bg: 'bg-th-divide-verse4',
  },
  {
    border: 'border-th-divide-verse5',
    bg: 'bg-th-divide-verse5',
  },
  {
    border: 'border-th-divide-verse6',
    bg: 'bg-th-divide-verse6',
  },
  {
    border: 'border-th-divide-verse7',
    bg: 'bg-th-divide-verse7',
  },
  {
    border: 'border-th-divide-verse8',
    bg: 'bg-th-divide-verse8',
  },
  {
    border: 'border-th-divide-verse9',
    bg: 'bg-th-divide-verse9',
  },
]

const defaultColor = {
  border: 'border-th-primary-100',
  bg: 'bg-th-secondary-10',
  text: 'text-th-secondary-300',
}

function ChapterVersesPage() {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const {
    query: { code, bookid, chapterid },
  } = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const [project] = useProject({ code })
  const [book] = useGetBook({ code, book_code: bookid })
  const [chapter, { isLoading, mutate: mutateChapter, isValidating }] = useGetChapter({
    code,
    book_code: bookid,
    chapter_id: chapterid,
  })
  const [, { mutate: mutateChapters }] = useGetChapters({
    code,
    book_code: bookid,
  })
  const [verses, { mutate: mutateVerses }] = useGetVerses({
    code,
    book_code: bookid,
    chapter_id: chapter?.id,
  })
  const [{ isCoordinatorAccess }] = useAccess({ user_id: user?.id, code })
  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [translators, setTranslators] = useState([])
  const [versesDivided, setVersesDivided] = useState([])
  const [isHighlight, setIsHighlight] = useState(false)
  const [assignedTranslatorsIds, setAssignedTranslatorsIds] = useState(null)
  const [_translators] = useTranslators({
    code,
  })
  const assignedVerseTranslators = useMemo(
    () =>
      verses
        ?.filter((verse) => verse.project_translator_id)
        ?.map((verse) => verse.project_translator_id),
    [verses]
  )

  const isNotAllVersesDivided = useMemo(
    () => versesDivided?.some((verse) => !verse.project_translator_id),
    [versesDivided]
  )

  const choosedVerses = useMemo(
    () => versesDivided?.some((verse) => verse.project_translator_id),
    [versesDivided]
  )
  const [isChapterStarted, setIsChapterStarted] = useState(!!chapter?.started_at)

  useEffect(() => {
    setIsChapterStarted(!!chapter?.started_at)
  }, [chapter])

  useEffect(() => {
    const getAssignedTranslatorsIds = async () => {
      const { data: assigned, error } = await supabase
        .from('verses')
        .select('project_translator_id')
        .eq('chapter_id', chapter.id)
        .gt('num', 200)
        .not('project_translator_id', 'is', null)
      if (error) {
        console.log(error)
        return
      }
      setAssignedTranslatorsIds(assigned?.map((el) => el.project_translator_id))
      mutateVerses()
    }
    if (chapter?.id) {
      getAssignedTranslatorsIds()
    }
  }, [chapter, chapter?.id, mutateVerses, supabase])

  useEffect(() => {
    if (_translators) {
      const translators = _translators?.map((translator, index) => ({
        ...translator,
        color: translatorColors[index % translatorColors.length],
      }))
      setTranslators(translators)
    }
  }, [_translators])

  useEffect(() => {
    if (!currentTranslator && translators && assignedTranslatorsIds) {
      setCurrentTranslator(
        translators.filter(
          (translator) => !assignedTranslatorsIds?.includes(translator.id)
        )[0]
      )
    }
  }, [assignedTranslatorsIds, currentTranslator, translators])

  useEffect(() => {
    if (verses) {
      const extVerses = verses?.map((verse) => {
        const translator = translators.find(
          (element) => element.id === verse.project_translator_id
        )
        return {
          ...verse,
          color: translator ? translator.color : defaultColor,
          translator_name: translator ? translator.users.login : '',
        }
      })
      setVersesDivided(extVerses)
    }
  }, [verses, translators])

  const coloring = (index) => {
    const newArr = [...versesDivided]
    if (newArr[index].project_translator_id) {
      newArr[index] = {
        ...newArr[index],
        translator_name: '',
        project_translator_id: null,
        color: defaultColor,
      }
    } else {
      newArr[index] = {
        ...newArr[index],
        translator_name: currentTranslator?.users?.login,
        project_translator_id: currentTranslator?.id,
        color: currentTranslator?.color,
      }
    }
    setVersesDivided(newArr)
  }
  const isCurrentTranlatorAvailable = useMemo(
    () => currentTranslator && !assignedTranslatorsIds.includes(currentTranslator.id),
    [assignedTranslatorsIds, currentTranslator]
  )

  const assign = () => {
    verseDividing(versesDivided)
  }
  const reset = () => {
    {
      const _versedivided = verses?.map((verse) => ({
        ...verse,
        color: defaultColor,
        translator_name: '',
        project_translator_id: null,
      }))
      if (choosedVerses) {
        verseDividing(_versedivided)
      }
      setVersesDivided(_versedivided)
      if (assignedTranslatorsIds?.length) {
        chapterAsigning([])
      }
      setAssignedTranslatorsIds([])
    }
  }
  const verseDividing = async (verses) => {
    //TODO сделать сравнение стейта до изменения и после - и если после изменения не нажали сохранить - проинформировать пользователя
    const { error } = await supabase.rpc('divide_verses', {
      divider: verses,
      project_id: project?.id,
    })

    if (error) {
      toast.error(t('SaveFailed'))
    } else {
      mutateVerses()
      toast.success(t('SaveSuccess'))
    }
  }
  const chapterAsigning = async (translators) => {
    const { error } = await supabase.rpc('chapter_assign', {
      translators,
      project_id: project?.id,
      chapter: chapter.id,
    })
    if (error) {
      toast.error(t('SaveFailed'))
      console.log(error)
      return
    } else {
      setVersesDivided((prev) =>
        prev?.map((verse) => {
          if (translators.includes(verse.project_translator_id)) {
            return {
              ...verse,
              color: defaultColor,
              translator_name: '',
              project_translator_id: null,
            }
          } else {
            return verse
          }
        })
      )
      mutateVerses()
      toast.success(t('SaveSuccess'))
    }
  }

  const translatorsSelecting = async (translator) => {
    const translators = assignedTranslatorsIds.includes(translator.id)
      ? assignedTranslatorsIds.filter((el) => el !== translator.id)
      : assignedTranslatorsIds.concat(translator.id)
    chapterAsigning(translators)
    setAssignedTranslatorsIds(translators)
  }

  const chapterProps = {
    chapter,
    isValidating,
    isLoading,
    verses,
    supabase,
    project,
    defaultColor,
    mutateChapter,
    mutateChapters,
    isChapterStarted,
    setIsChapterStarted,
  }

  const translatorsProps = {
    translators,
    assignedTranslatorsIds,
    assignedVerseTranslators,
    currentTranslator,
    setCurrentTranslator,
    translatorsSelecting,
  }

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-row gap-7">
        <div className="flex flex-col gap-7 w-full sm:w-3/5">
          <Breadcrumbs
            full
            links={[
              { title: project?.title, href: '/projects/' + code },
              {
                title: t(`books:${book?.code}`),
                href: '/projects/' + code + '/books/' + bookid,
              },
              { title: `${t('Chapter')} ${chapter?.num}` },
            ]}
          />
          <div className="card bg-th-secondary-10">
            <div
              onMouseDown={() => setIsHighlight(true)}
              onMouseUp={() => setIsHighlight(false)}
              onMouseLeave={() => setIsHighlight(false)}
              className={`w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 select-none ${
                translators?.length === 0 ? 'pointer-events-none' : ''
              }`}
            >
              {versesDivided.length > 0 ? (
                versesDivided
                  ?.filter((verse) => verse.num < 201)
                  ?.sort((a, b) => a.num > b.num)
                  .map((verse, index) => {
                    return (
                      <div
                        onMouseUp={() => {
                          if (
                            currentTranslator &&
                            !isChapterStarted &&
                            isCurrentTranlatorAvailable
                          ) {
                            coloring(index)
                          }
                        }}
                        onMouseLeave={() => {
                          if (
                            isHighlight &&
                            currentTranslator &&
                            !isChapterStarted &&
                            isCurrentTranlatorAvailable
                          ) {
                            coloring(index)
                          }
                        }}
                        className={`truncate h-24 ${
                          currentTranslator && !isChapterStarted
                            ? 'verse-block cursor-pointer'
                            : ''
                        } ${chapter?.started_at ? 'opacity-70' : ''}`}
                        key={index}
                      >
                        <div
                          className={`${verse.color?.bg}  ${
                            verse.color?.border
                          } border-2 truncate rounded-2xl ${
                            currentTranslator ? '' : 'flex'
                          } w-full h-full flex-col p-4 justify-between`}
                        >
                          <div
                            className={`${
                              [0, 200].includes(verse.num) ? 'text-xl' : 'text-xl'
                            } font-bold text-ellipsis overflow-hidden`}
                          >
                            {verse.num === 0
                              ? t('Title')
                              : verse.num === 200
                              ? t('Reference')
                              : verse.num}
                          </div>
                          <div className="text-ellipsis overflow-hidden">
                            {verse.translator_name}
                          </div>
                        </div>
                        <div
                          className={`${
                            currentTranslator ? '' : 'hidden'
                          } w-full h-full rounded-2xl justify-center p-1 items-center bg-th-primary-100`}
                        >
                          {!chapter?.started_at && (
                            <div className="w-10 h-10 p-2 text-th-text-primary bg-th-secondary-10 border-2 rounded-full">
                              {verse.translator_name ? (
                                <Minus className="w-5 h-5 stroke-th-text-primary" />
                              ) : (
                                <Plus className="w-5 h-5 stroke-th-text-primary" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
              ) : (
                <>
                  {[...Array(21).keys()].map((el) => (
                    <div role="status" className="h-24 animate-pulse" key={el}>
                      <div className="h-full w-full bg-th-secondary-100 rounded-2xl"></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:block w-2/5">
          <div className="sticky top-7 flex flex-col gap-7">
            <Card
              title={t('chapters:Assignment')}
              link={`/projects/${code}/edit?setting=participants`}
              access={isCoordinatorAccess}
            >
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
              <div className="flex flex-col gap-3">
                <hr className="border-th-secondary-300" />
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
                  t={t}
                  defaultColor={defaultColor}
                  translator={currentTranslator}
                  isTranslatorSelected={!!currentTranslator}
                  isDivide={!!assignedVerseTranslators?.length}
                />
              </div>
            </Card>
            <div className="card flex flex-col gap-4 bg-th-secondary-10">
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
          </div>
        </div>
      </div>
      <ChapterMobileMenu
        chapterProps={chapterProps}
        translatorsProps={translatorsProps}
        versesDivided={versesDivided}
        setVersesDivided={setVersesDivided}
        choosedVerses={choosedVerses}
        isNotAllVersesDivided={isNotAllVersesDivided}
        assign={assign}
        reset={reset}
        t={t}
      />
    </div>
  )
}

export default ChapterVersesPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'projects',
        'common',
        'chapters',
        'books',
        'users',
      ])),
    },
  }
}
