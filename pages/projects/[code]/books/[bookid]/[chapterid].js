import { Fragment, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import toast from 'react-hot-toast'

import { Menu, Switch, Transition } from '@headlessui/react'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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

import TranslatorImage from 'components/TranslatorImage'
import ButtonLoading from 'components/ButtonLoading'

import Gear from 'public/gear.svg'
import Plus from 'public/plus.svg'
import Minus from 'public/minus.svg'
import Card from 'components/Project/Card'
import Breadcrumbs from 'components/Breadcrumbs'

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
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-row gap-7">
        <div className="flex flex-col gap-7 w-full sm:w-3/5">
          <Breadcrumbs
            full
            links={[
              {
                title: project?.title,
                href: '/projects/' + project?.code,
              },
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
                <Participants
                  participants={translators}
                  assignedTranslatorsIds={assignedTranslatorsIds}
                  assignedVerseTranslators={assignedVerseTranslators}
                  currentTranslator={currentTranslator}
                  setCurrentTranslator={setCurrentTranslator}
                  translatorsSelecting={translatorsSelecting}
                />
              </div>
              <div className="flex flex-col gap-3">
                <hr className="border-th-secondary-300" />
                <DividingButtons
                  translators={translators}
                  setVersesDivided={setVersesDivided}
                  versesDivided={versesDivided}
                  isChapterStarted={isChapterStarted}
                  assignedTranslatorsIds={assignedTranslatorsIds}
                  choosedVerses={choosedVerses}
                  isNotAllVersesDivided={isNotAllVersesDivided}
                  assign={assign}
                  reset={reset}
                />
              </div>
            </Card>
            <div className="card flex flex-col gap-4 bg-th-secondary-10">
              <ManageChapterButtons
                chapter={chapter}
                isValidating={isValidating}
                isLoading={isLoading}
                verses={verses}
                supabase={supabase}
                project={project}
                mutateChapter={mutateChapter}
                mutateChapters={mutateChapters}
                setIsChapterStarted={setIsChapterStarted}
              />
            </div>
          </div>
        </div>
      </div>
      <Menu>
        {({ open }) => (
          <>
            <div
              className={`inset-0 bg-zink-500 bg-opacity-10 backdrop-blur backdrop-filter ${
                open ? 'fixed' : 'hidden'
              } `}
            ></div>
            <Menu.Button
              className="fixed sm:hidden p-4 translate-y-1/2
               bottom-[60vh]
               right-5 z-10 rounded-full bg-th-primary-100 text-th-text-secondary-100 transition-all duration-700"
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
                className={`fixed bottom-0 left-0 w-full min-h-[60vh] overflow-y-auto rounded-t-2xl bg-th-secondary-10`}
              >
                {open && (
                  <Menu.Items>
                    <div className="flex gap-2 items-center">
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
                            <Participants
                              participants={translators}
                              assignedTranslatorsIds={assignedTranslatorsIds}
                              assignedVerseTranslators={assignedVerseTranslators}
                              currentTranslator={currentTranslator}
                              setCurrentTranslator={setCurrentTranslator}
                              translatorsSelecting={translatorsSelecting}
                            />
                          </div>
                        ) : (
                          <>
                            {[...Array(4).keys()].map((el) => (
                              <div
                                role="status"
                                className="w-full animate-pulse"
                                key={el}
                              >
                                <div className="h-[68px] bg-th-secondary-100 rounded-2xl w-full"></div>
                              </div>
                            ))}
                          </>
                        )}
                        <DividingButtons
                          translators={translators}
                          setVersesDivided={setVersesDivided}
                          versesDivided={versesDivided}
                          isChapterStarted={isChapterStarted}
                          assignedTranslatorsIds={assignedTranslatorsIds}
                          choosedVerses={choosedVerses}
                          isNotAllVersesDivided={isNotAllVersesDivided}
                          assign={assign}
                          reset={reset}
                        />

                        <ManageChapterButtons
                          chapter={chapter}
                          isValidating={isValidating}
                          isLoading={isLoading}
                          verses={verses}
                          supabase={supabase}
                          project={project}
                          mutateChapter={mutateChapter}
                          mutateChapters={mutateChapters}
                          setIsChapterStarted={setIsChapterStarted}
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

function Participants({
  participants,
  assignedTranslatorsIds,
  assignedVerseTranslators,
  currentTranslator,
  setCurrentTranslator,
  translatorsSelecting,
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2.5 mb-2.5">
      <div className="flex justify-end">{t('chapters:ReadOnly')}</div>
      {participants.length > 0 ? (
        participants?.map((participant, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
            onClick={() => {
              if (!assignedTranslatorsIds?.includes(participant.id)) {
                setCurrentTranslator(participant)
              }
            }}
          >
            <div
              className={`flex flex-1 items-center gap-4 px-4 py-1 border rounded-3xl w-5/6 ${
                assignedTranslatorsIds?.includes(participant.id)
                  ? 'bg-th-secondary-200 text-th-text-secondary-100'
                  : ''
              } ${
                currentTranslator?.users?.login === participant.users.login
                  ? `${participant.color.bg} ${participant.color.border}`
                  : `${participant.color.text} text-th-text-primary`
              }`}
            >
              <div className="w-7 h-7 min-w-[2rem]">
                <TranslatorImage item={participant} />
              </div>
              <div>
                <p className="text-lg">{participant?.users?.login}</p>
                <div className="text-sm">
                  {participant.is_moderator ? (
                    <p>{t('Moderator')}</p>
                  ) : (
                    <p>{t('Translator')}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/6">
              <Switch
                disabled={assignedVerseTranslators?.includes(participant.id)}
                checked={assignedTranslatorsIds?.includes(participant.id) ?? false}
                onChange={() => {
                  if (!assignedVerseTranslators?.includes(participant.id)) {
                    translatorsSelecting(participant)
                  }
                  if (
                    participant.id === currentTranslator?.id &&
                    !assignedVerseTranslators?.includes(participant.id)
                  ) {
                    setCurrentTranslator(null)
                  }
                }}
                className={`${
                  assignedTranslatorsIds?.includes(participant.id)
                    ? 'bg-secondary-10'
                    : 'bg-th-secondary-200 border-th-secondary-200'
                } relative inline-flex h-7 w-12 items-center border rounded-full`}
              >
                <span
                  className={`${
                    assignedTranslatorsIds?.includes(participant.id)
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full ${
                    assignedVerseTranslators?.includes(participant.id)
                      ? 'bg-th-secondary-10 cursor-default'
                      : 'bg-th-primary-100'
                  } transition`}
                />
              </Switch>
            </div>
          </div>
        ))
      ) : (
        <>
          {[...Array(4).keys()].map((el) => (
            <div role="status" className="w-full animate-pulse" key={el}>
              <div className="h-[68px] bg-th-secondary-100 rounded-2xl w-full"></div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function DividingButtons({
  translators,
  setVersesDivided,
  versesDivided,
  isChapterStarted,
  assignedTranslatorsIds,
  choosedVerses,
  isNotAllVersesDivided,
  assign,
  reset,
}) {
  const { t } = useTranslation(['common', 'chapters'])
  function fastDivideVerses(verses, translators) {
    const freeTranslators = translators.filter(
      (translator) => !assignedTranslatorsIds.includes(translator.id)
    )
    const totalVerses = verses.length
    const baseCount = Math.floor(totalVerses / freeTranslators.length)
    let remainingVerses = totalVerses % freeTranslators.length
    let currentStartIndex = 0
    const indexIntervals = freeTranslators.map((_translator, index) => {
      const versesForCurrentTranslator = baseCount + (index < remainingVerses ? 1 : 0)
      const interval = {
        start: currentStartIndex,
        end: currentStartIndex + versesForCurrentTranslator,
      }
      currentStartIndex += versesForCurrentTranslator
      return interval
    })
    return verses.map((verse, index) => {
      const currentTranslatorIndex = indexIntervals.findIndex(
        (interval) => index >= interval.start && index < interval.end
      )
      const assignedTranslator = freeTranslators[currentTranslatorIndex]

      return {
        ...verse,
        project_translator_id: assignedTranslator.id,
        color: assignedTranslator.color,
        translator_name: assignedTranslator?.users?.login,
      }
    })
  }
  return (
    <>
      <ButtonLoading
        onClick={() => {
          const verses = fastDivideVerses(versesDivided, translators)
          if (!verses) {
            return
          }
          setVersesDivided(verses)
        }}
        disabled={
          !translators?.length ||
          isChapterStarted ||
          assignedTranslatorsIds?.length === translators?.length
        }
        className="relative btn-primary"
      >
        {t('chapters:FastDivide')}
      </ButtonLoading>
      <div className="flex gap-4">
        <ButtonLoading
          onClick={() => {
            assign()
          }}
          disabled={!translators?.length || isNotAllVersesDivided || isChapterStarted}
          className="flex-1 relative btn-primary w-fit"
        >
          {t('Assign')}
        </ButtonLoading>
        <ButtonLoading
          onClick={() => reset()}
          disabled={!translators?.length || !choosedVerses || isChapterStarted}
          className="flex-1 relative btn-primary w-fit"
        >
          {t('Reset')}
        </ButtonLoading>
      </div>
    </>
  )
}

function ManageChapterButtons({
  chapter,
  isValidating,
  isLoading,
  verses,
  supabase,
  project,
  mutateChapter,
  mutateChapters,
  setIsChapterStarted,
}) {
  const { t } = useTranslation(['common', 'chapters'])
  const [isLoadingCancelFinish, setIsLoadingCancelFinish] = useState(false)

  const changeFinishChapter = () => {
    setIsLoadingCancelFinish(true)
    supabase
      .rpc('change_finish_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
      })
      .catch(console.log)
      .finally(() => setIsLoadingCancelFinish(false))
  }
  const changeStartChapter = () => {
    supabase
      .rpc('change_start_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
        setIsChapterStarted(true)
      })
      .catch(console.log)
  }
  return (
    <>
      {!chapter?.finished_at &&
        (!chapter?.started_at ? (
          <ButtonLoading
            onClick={changeStartChapter}
            isLoading={isValidating || isLoading}
            disabled={
              chapter?.finished_at ||
              isValidating ||
              verses?.some((verse) => {
                return verse.project_translator_id === null
              })
            }
            className="relative btn-primary"
          >
            {t('chapters:StartChapter')}
          </ButtonLoading>
        ) : (
          ''
        ))}
      {chapter?.started_at && (
        <ButtonLoading
          onClick={changeFinishChapter}
          color={!chapter?.finished_at ? 'secondary' : 'primary'}
          className="relative btn-primary"
          disabled={isValidating}
          isLoading={isLoadingCancelFinish}
        >
          {!chapter?.finished_at
            ? t('chapters:FinishedChapter')
            : t('chapters:CancelFinishedChapter')}
        </ButtonLoading>
      )}
    </>
  )
}
