import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import toast, { Toaster } from 'react-hot-toast'

import { Menu, Transition } from '@headlessui/react'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import useSupabaseClient from 'utils/supabaseClient'
import {
  useGetBook,
  useGetChapter,
  useGetChapters,
  useGetVerses,
  useProject,
  useTranslators,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

import Button from 'components/Button'
import Card from 'components/Project/Card'
import Breadcrumbs from 'components/Breadcrumbs'

import Gear from 'public/gear.svg'
import Spinner from 'public/spinner.svg'
import Sparkles from 'public/sparkles.svg'
import Plus from 'public/plus.svg'
import Minus from 'public/minus.svg'
import Trash from 'public/trash.svg'
import Check from 'public/check.svg'

const translatorColors = [
  { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { border: 'border-teal-500', bg: 'bg-teal-500', text: 'text-teal-500' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { border: 'border-sky-500', bg: 'bg-sky-500', text: 'text-sky-500' },
  { border: 'border-emerald-700', bg: 'bg-emerald-700', text: 'text-emerald-700' },
  { border: 'border-teal-700', bg: 'bg-teal-700', text: 'text-teal-700' },
  { border: 'border-cyan-700', bg: 'bg-cyan-700', text: 'text-cyan-700' },
  { border: 'border-sky-700', bg: 'bg-sky-700', text: 'text-sky-700' },
]

const defaultColor = {
  border: 'border-slate-900',
  bg: 'bg-white',
  text: 'text-slate-900',
}

function ChapterVersesPage() {
  const supabase = useSupabaseClient()
  const {
    query: { code, bookid, chapterid },
  } = useRouter()
  const { t } = useTranslation(['common', 'chapters'])
  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, code })
  const [book] = useGetBook({ token: user?.access_token, code, book_code: bookid })
  const [chapter, { isLoading, mutate: mutateChapter, isValidating }] = useGetChapter({
    token: user?.access_token,
    code,
    book_code: bookid,
    chapter_id: chapterid,
  })
  const [, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code,
    book_code: bookid,
  })

  const [verses, { mutate: mutateVerses }] = useGetVerses({
    token: user?.access_token,
    code,
    book_code: bookid,
    chapter_id: chapter?.id,
  })

  const changeStartChapter = () => {
    supabase
      .rpc('change_start_chapter', {
        chapter_id: chapter?.id,
        project_id: project?.id,
      })
      .then(() => {
        mutateChapter()
        mutateChapters()
      })
      .catch(console.log)
  }

  const changeFinishChapter = () => {
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
  }

  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [translators, setTranslators] = useState([])
  const [versesDivided, setVersesDivided] = useState([])
  const [isHighlight, setIsHighlight] = useState(false)

  const [_translators] = useTranslators({
    token: user?.access_token,
    code,
  })

  useEffect(() => {
    if (_translators) {
      const translators = _translators?.map((translator, index) => ({
        ...translator,
        color: translatorColors[index % translatorColors.length],
      }))
      setTranslators(translators)
      setCurrentTranslator(translators[0])
    }
  }, [_translators])

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

  const verseDividing = async () => {
    //TODO сделать сравнение стейта до изменения и после - и если после изменения не нажали сохранить - проинформировать пользователя
    const { error } = await supabase.rpc('divide_verses', {
      divider: versesDivided,
      project_id: project?.id,
    })

    if (error) {
      toast.error(t('SaveFailed'))
    } else {
      mutateVerses()
      toast.success(t('SaveSuccess'))
    }
  }
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-row gap-7">
        <div className="flex flex-col gap-7 w-full sm:w-2/3">
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
          <div className="card text-slate-900">
            <div
              onMouseDown={() => setIsHighlight(true)}
              onMouseUp={() => setIsHighlight(false)}
              onMouseLeave={() => setIsHighlight(false)}
              className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 select-none"
            >
              {versesDivided.length > 0 ? (
                versesDivided
                  ?.sort((a, b) => a.num > b.num)
                  .map((verse, index) => {
                    return (
                      <div
                        onMouseUp={() => {
                          if (currentTranslator !== null) {
                            coloring(index)
                          }
                        }}
                        onMouseLeave={() => {
                          if (isHighlight && currentTranslator !== null) {
                            coloring(index)
                          }
                        }}
                        className={`truncate h-24 ${
                          currentTranslator ? 'verse-block cursor-pointer' : ''
                        }`}
                        key={index}
                      >
                        <div
                          className={`${verse.color.bg} ${
                            verse.color.bg === 'bg-white' ? '' : 'text-white'
                          } ${verse.color.border} border-2 truncate rounded-2xl ${
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
                          } w-full h-full rounded-2xl justify-center p-1 items-center`}
                          style={{
                            background: verse.translator_name
                              ? 'linear-gradient(90deg, #2E4057 1%, #596B84 98%)'
                              : 'linear-gradient(90deg, #B7C9E5 1%, #A5B5CE 98%)',
                          }}
                        >
                          <div className="w-10 h-10 p-2 shadow-md text-slate-900 bg-white border-white border-2 rounded-full">
                            {verse.translator_name ? (
                              <Minus className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <>
                  {[...Array(21).keys()].map((el) => (
                    <div role="status" className="h-24 animate-pulse" key={el}>
                      <div className="h-full bg-gray-200 rounded-2xl w-full"></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:block w-1/3">
          <div className="sticky top-7 flex flex-col gap-7">
            <Card title={t('chapters:Assignment')}>
              <div className="flex flex-col gap-3">
                {translators.length > 0 ? (
                  translators?.map((translator, index) => (
                    <div key={index} className="flex">
                      <div
                        onClick={() => setCurrentTranslator(translator)}
                        className={`flex flex-row w-full items-center p-2 font-semibold text-xl ${
                          currentTranslator?.users?.login === translator.users.login
                            ? `${translator.color.bg} text-white shadow-md`
                            : `${translator.color.text} text-slate-900`
                        } ${translator.color.border} border-2 cursor-pointer rounded-2xl`}
                      >
                        <div className="avatar-block w-10 flex-grow-0">
                          <div
                            className={`flex items-center justify-center w-10 h-10 uppercase text-white ${translator.color.bg} border-2 border-white rounded-full`}
                          >
                            {translator.users.login.slice(0, 1)}
                          </div>
                        </div>
                        <div className="text-block flex-auto ml-2 overflow-hidden text-base font-normal text-left text-ellipsis">
                          {translator.users.login} <br />
                          {translator.users.email}
                        </div>
                        <div className="icon-block flex-grow-0">
                          <div
                            className={`p-2 bg-white rounded-full border-2 ${
                              currentTranslator?.users?.login === translator.users.login
                                ? `border-white shadow-md`
                                : `${translator.color.border}`
                            } ${translator.color.text}`}
                          >
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {[...Array(4).keys()].map((el) => (
                      <div role="status" className="w-full animate-pulse" key={el}>
                        <div className="h-[68px] bg-gray-200 rounded-2xl w-full"></div>
                      </div>
                    ))}
                  </>
                )}
                <hr className="border-gray-500" />
                <Button
                  onClick={verseDividing}
                  text={t('Save')}
                  color="green"
                  icon={<Check className="w-5 h-5" />}
                />
                <Button
                  onClick={() =>
                    setVersesDivided(
                      verses?.map((verse) => ({
                        ...verse,
                        color: defaultColor,
                        translator_name: '',
                        project_translator_id: null,
                      }))
                    )
                  }
                  text={t('Reset')}
                  color="red"
                  icon={<Trash className="w-5 h-5" />}
                />
              </div>
            </Card>
            <div className="card flex flex-col gap-4">
              {!chapter?.finished_at &&
                (!chapter?.started_at ? (
                  <Button
                    onClick={changeStartChapter}
                    text={t('chapters:StartChapter')}
                    color={'green'}
                    icon={<Check className="w-5 h-5" />}
                    disabled={chapter?.finished_at || isValidating}
                    avatar={
                      isValidating || isLoading ? (
                        <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                      ) : (
                        ''
                      )
                    }
                  />
                ) : (
                  <Button
                    onClick={changeStartChapter}
                    text={t('chapters:CancelStartChapter')}
                    color={'red'}
                    icon={<Trash className="w-5 h-5" />}
                    disabled={chapter?.finished_at || isValidating}
                    avatar={
                      isValidating || isLoading ? (
                        <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                      ) : (
                        ''
                      )
                    }
                  />
                ))}
              {chapter?.started_at && (
                <Button
                  onClick={changeFinishChapter}
                  text={
                    !chapter?.finished_at
                      ? t('chapters:FinishedChapter')
                      : t('chapters:CancelFinishedChapter')
                  }
                  color={!chapter?.finished_at ? 'amber' : 'red'}
                  icon={
                    !chapter?.finished_at ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Trash className="w-5 h-5" />
                    )
                  }
                  disabled={isValidating}
                  avatar={
                    isValidating || isLoading ? (
                      <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      ''
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Menu>
        {({ open }) => (
          <>
            <div
              className={`inset-0 bg-black opacity-50 backdrop-filter ${
                open ? 'fixed' : 'hidden'
              } `}
            ></div>
            <Menu.Button
              className={`fixed sm:hidden p-4 translate-y-1/2
               bottom-[60vh]
               right-10 z-50 rounded-full bg-slate-600 text-white transition-all duration-700 shadow-2xl`}
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
                className={`fixed bottom-0 left-0 w-full min-h-[60vh] overflow-y-auto rounded-t-2xl shadow-md bg-white`}
              >
                {open && (
                  <Menu.Items>
                    <div className="flex gap-2 items-center">
                      <div className="p-4 text-xl font-bold">{t('Participants')}</div>
                      <Link href={`/projects/${project?.code}/edit?setting=participants`}>
                        <Gear className="w-6 h-6 min-w-[1.5rem]" />
                      </Link>
                    </div>

                    <Menu.Item
                      as="div"
                      className="px-4 h-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col gap-3 h-full">
                        <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-scroll px-2">
                          {translators.length > 0 ? (
                            translators?.map((translator, index) => (
                              <div key={index} className="flex">
                                <div
                                  onClick={() => setCurrentTranslator(translator)}
                                  className={`flex flex-row w-full items-center p-2 font-semibold text-xl ${
                                    currentTranslator?.users?.login ===
                                    translator.users.login
                                      ? `${translator.color.bg} text-white shadow-md`
                                      : `${translator.color.text} text-slate-900`
                                  } ${
                                    translator.color.border
                                  } border-2 cursor-pointer rounded-2xl`}
                                >
                                  <div className="avatar-block w-10 flex-grow-0">
                                    <div
                                      className={`flex items-center justify-center w-10 h-10 uppercase text-white ${translator.color.bg} border-2 border-white rounded-full`}
                                    >
                                      {translator.users.login.slice(0, 1)}
                                    </div>
                                  </div>
                                  <div className="text-block flex-auto ml-2 overflow-hidden text-base font-normal text-left text-ellipsis">
                                    {translator.users.login} <br />
                                    {translator.users.email}
                                  </div>
                                  <div className="icon-block flex-grow-0"></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <>
                              {[...Array(4).keys()].map((el) => (
                                <div
                                  role="status"
                                  className="w-full animate-pulse"
                                  key={el}
                                >
                                  <div className="h-[68px] bg-gray-200 rounded-2xl w-full"></div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2border-t border-gray-400">
                          <Button
                            onClick={verseDividing}
                            text={t('Save')}
                            color="green"
                            icon={<Check className="w-5 h-5" />}
                          />
                          <Button
                            onClick={() =>
                              setVersesDivided(
                                verses?.map((verse) => ({
                                  ...verse,
                                  color: defaultColor,
                                  translator_name: '',
                                  project_translator_id: null,
                                }))
                              )
                            }
                            text={t('Reset')}
                            color="red"
                            icon={<Trash className="w-5 h-5" />}
                          />
                          {!chapter?.finished_at &&
                            (!chapter?.started_at ? (
                              <Button
                                onClick={changeStartChapter}
                                text={t('chapters:StartChapter')}
                                color={'green'}
                                icon={<Check className="w-5 h-5" />}
                                disabled={chapter?.finished_at || isValidating}
                                avatar={
                                  isValidating || isLoading ? (
                                    <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                                  ) : (
                                    ''
                                  )
                                }
                              />
                            ) : (
                              <Button
                                onClick={changeStartChapter}
                                text={t('chapters:CancelStartChapter')}
                                color={'red'}
                                icon={<Trash className="w-5 h-5" />}
                                disabled={chapter?.finished_at || isValidating}
                                avatar={
                                  isValidating || isLoading ? (
                                    <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                                  ) : (
                                    ''
                                  )
                                }
                              />
                            ))}
                          {chapter?.started_at && (
                            <Button
                              onClick={changeFinishChapter}
                              text={
                                !chapter?.finished_at
                                  ? t('chapters:FinishedChapter')
                                  : t('chapters:CancelFinishedChapter')
                              }
                              color={!chapter?.finished_at ? 'amber' : 'red'}
                              icon={
                                !chapter?.finished_at ? (
                                  <Sparkles className="w-5 h-5" />
                                ) : (
                                  <Trash className="w-5 h-5" />
                                )
                              }
                              disabled={isValidating}
                              avatar={
                                isValidating || isLoading ? (
                                  <Spinner className="h-5 w-5 text-gray-400 animate-spin" />
                                ) : (
                                  ''
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </Menu.Item>
                  </Menu.Items>
                )}
              </div>
            </Transition>
          </>
        )}
      </Menu>
      <Toaster />
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
