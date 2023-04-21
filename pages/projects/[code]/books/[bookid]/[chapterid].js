import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import toast, { Toaster } from 'react-hot-toast'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { supabase } from 'utils/supabaseClient'
import {
  useGetBook,
  useGetChapter,
  useGetChapters,
  useGetVerses,
  useProject,
  useTranslators,
} from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

import LeftArrow from 'public/left.svg'
import Spinner from 'public/spinner.svg'
import Sparkles from 'public/sparkles.svg'
import Plus from 'public/plus.svg'
import Minus from 'public/minus.svg'
import Trash from 'public/trash.svg'
import Check from 'public/check.svg'
import Parameters from 'public/parameters.svg'

const defaultColor = [
  { border: 'border-yellow-400', bg: 'bg-yellow-400', text: 'text-yellow-400' },
  { border: 'border-red-400', bg: 'bg-red-400', text: 'text-red-400' },
  { border: 'border-blue-400', bg: 'bg-blue-400', text: 'text-blue-400' },
  { border: 'border-pink-400', bg: 'bg-pink-400', text: 'text-pink-400' },
  { border: 'border-violet-400', bg: 'bg-violet-400', text: 'text-violet-400' },
  { border: 'border-orange-400', bg: 'bg-orange-400', text: 'text-orange-400' },
  { border: 'border-cyan-400', bg: 'bg-cyan-400', text: 'text-cyan-400' },
  { border: 'border-fuchsia-400', bg: 'bg-fuchsia-400', text: 'text-fuchsia-400' },
  { border: 'border-teal-400', bg: 'bg-teal-400', text: 'text-teal-400' },
]

const slateColor = {
  border: 'border-slate-900',
  bg: 'bg-white',
  text: 'text-slate-900',
}

function ChapterVersesPage() {
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
  const [_, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code,
    book_code: bookid,
  })
  const [verses] = useGetVerses({
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
  }

  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [colorTranslators, setColorTranslators] = useState([])
  const [versesDivided, setVersesDivided] = useState([])
  const [isHighlight, setIsHighlight] = useState(false)

  const [translators] = useTranslators({
    token: user?.access_token,
    code,
  })

  useEffect(() => {
    const colorTranslators = translators?.map((translator, index) => ({
      ...translator,
      color: defaultColor[index],
    }))
    setColorTranslators(colorTranslators)
  }, [translators])

  useEffect(() => {
    if (colorTranslators?.length > 0) {
      const extVerses = verses?.map((verse) => {
        const translator = colorTranslators.find(
          (element) => element.id === verse.project_translator_id
        )

        return {
          ...verse,
          color: translator ? translator.color : slateColor,

          translator_name: translator ? translator.users.login : '',
        }
      })
      setVersesDivided(extVerses)
    }
  }, [verses, colorTranslators])

  const coloring = (index) => {
    const newArr = [...versesDivided]
    if (newArr[index].project_translator_id) {
      newArr[index] = {
        ...newArr[index],
        translator_name: '',
        project_translator_id: null,
        color: slateColor,
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
    let { data, error } = await supabase.rpc('divide_verses', {
      divider: versesDivided,
      project_id: project?.id,
    })

    if (error) {
      console.error(error)
      toast.error(t('SaveFailed'))
    } else {
      console.log('Success', data)
      toast.success(t('SaveSuccess'))
    }
  }

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-row gap-7">
        <div className="flex flex-col gap-7 w-2/3">
          <div className="card flex flex-row gap-3 text-xl text-slate-900 font-medium items-center">
            <LeftArrow className="h-5 w-5" />
            <Link href={'/projects/' + code}>
              <a className="hover:underline">{project?.title}</a>
            </Link>
            <span>/</span>
            <Link href={'/projects/' + code + '?book=' + bookid}>
              <a className="hover:underline">{t(`books:${book?.code}`)}</a>
            </Link>
          </div>
          <div className="card text-slate-900">
            <div className="font-bold mb-7">
              <span className="text-3xl">{t(`books:${book?.code}`)}</span>
              <span className="text-xl ml-7">
                {t('Chapter')} {chapter?.num}
              </span>
            </div>
            <div
              onMouseDown={() => setIsHighlight(true)}
              onMouseUp={() => setIsHighlight(false)}
              onMouseLeave={() => setIsHighlight(false)}
              className="select-none lg:grid-cols-6 grid-cols-4 grid gap-3 w-full"
            >
              {versesDivided
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
                      // onClick={() => {
                      //   if (currentTranslator === null) {
                      //     return
                      //   }
                      //   console.log('onClick')
                      //   coloring(index)
                      // }}
                      className={`truncate aspect-1 ${
                        currentTranslator ? 'verse-block cursor-pointer' : ''
                      }`}
                      key={index}
                    >
                      <div
                        className={`${verse?.color.bg ?? 'bg-white'} ${
                          verse?.color.border ?? 'border-slate-900'
                        } border-2 truncate rounded-2xl ${
                          currentTranslator ? '' : 'flex'
                        } w-full h-full flex-col p-1 justify-between`}
                      >
                        <div className="ml-2 text-2xl font-bold">
                          {verse.num === 0
                            ? t('Title')
                            : verse.num === 200
                            ? t('Reference')
                            : verse.num}
                        </div>
                        <div className="text-center text-ellipsis overflow-hidden">
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
                        <div className="border-white shadow-md text-slate-900 w-10 h-10 bg-white border-2 rounded-full p-2">
                          {verse.translator_name ? (
                            <Minus className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="sticky top-7 flex flex-col gap-7">
            <div className="card flex flex-col gap-3">
              <div className="flex flex-row justify-between items-center text-slate-900">
                <h3 className="text-2xl font-bold">Назначение участников</h3>
                <Parameters
                  className="h-10 w-10 p-2 cursor-pointer"
                  onClick={() => {
                    alert('Settings')
                  }}
                />
              </div>
              {colorTranslators?.map((translator, index) => (
                <div key={index} className="flex">
                  <div
                    onClick={() => setCurrentTranslator(translator)}
                    className={`${
                      currentTranslator?.users?.login === translator.users.login
                        ? `${translator.color.bg} text-white shadow-md`
                        : `${translator.color.text} text-slate-900`
                    } ${
                      translator.color.border
                    }  border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl`}
                  >
                    <div className="avatar-block w-10 flex-grow-0">
                      <div
                        className={`${translator.color.bg} border-white uppercase text-white border-2 rounded-full w-10 h-10 flex items-center justify-center`}
                      >
                        {translator.users.login.slice(0, 1)}
                      </div>
                    </div>
                    <div className="text-block ml-2 text-base font-normal flex-auto text-left">
                      {translator.users.login} <br />
                      {translator.users.email}
                    </div>
                    <div className="icon-block flex-grow-0">
                      <div
                        className={`${
                          currentTranslator?.users?.login === translator.users.login
                            ? `border-white shadow-md`
                            : `${translator.color.border}`
                        } ${translator.color.text} bg-white border-2 rounded-full p-2`}
                      >
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <hr className="border-gray-500" />
              <button
                onClick={verseDividing}
                className={`border-green-500 text-green-500 border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl`}
              >
                <div className="avatar-block w-10 flex-grow-0"></div>
                <div className="text-block ml-2 flex-auto text-left">{t('Save')}</div>
                <div className="icon-block flex-grow-0">
                  <div className="border-green-500 border-2 rounded-full p-2">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </button>
              <button
                onClick={() =>
                  setVersesDivided(
                    verses?.map((verse) => ({
                      ...verse,
                      color: 'bg-slate-300',
                      translator_name: '',
                      project_translator_id: null,
                    }))
                  )
                }
                className={`border-red-500 text-red-500 border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl`}
              >
                <div className="avatar-block w-10 flex-grow-0"></div>
                <div className="text-block ml-2 flex-auto text-left">{t('Reset')}</div>
                <div className="icon-block flex-grow-0">
                  <div className="border-red-500 border-2 rounded-full p-2">
                    <Trash className="w-5 h-5" />
                  </div>
                </div>
              </button>
            </div>
            <div className="card flex flex-col gap-4">
              {!chapter?.finished_at && (
                <button
                  className={`${
                    !chapter?.started_at
                      ? 'border-green-500 text-green-500'
                      : 'border-red-500 text-red-500'
                  } border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl`}
                  onClick={changeStartChapter}
                  disabled={chapter?.finished_at || isValidating}
                >
                  <div className="avatar-block w-10 flex-grow-0">
                    {isValidating || isLoading ? (
                      <Spinner className="animate-spin h-5 w-5 text-gray-400" />
                    ) : (
                      ''
                    )}
                  </div>
                  {!chapter?.started_at ? (
                    <>
                      <div className="text-block ml-2 flex-auto text-left">
                        {t('chapters:StartChapter')}
                      </div>
                      <div className="icon-block flex-grow-0">
                        <div className=" border-2 border-green-500 rounded-full p-2">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-block ml-2 flex-auto text-left">
                        {t('chapters:CancelStartChapter')}
                      </div>
                      <div className="icon-block flex-grow-0">
                        <div className="border-2 border-red-500 rounded-full p-2">
                          <Trash className="w-5 h-5" />
                        </div>
                      </div>
                    </>
                  )}
                </button>
              )}
              {!isValidating && chapter?.started_at && (
                <>
                  <button
                    className={`${
                      !chapter?.finished_at
                        ? 'border-amber-500 text-amber-500'
                        : 'border-red-500 text-red-500'
                    } border-2 cursor-pointer p-2 w-full items-center rounded-2xl flex flex-row font-semibold text-xl`}
                    onClick={changeFinishChapter}
                    disabled={isValidating}
                  >
                    <div className="avatar-block w-10 flex-grow-0">
                      {isValidating || isLoading ? (
                        <Spinner className="animate-spin h-5 w-5 text-gray-400" />
                      ) : (
                        ''
                      )}
                    </div>
                    {!chapter?.finished_at ? (
                      <>
                        <div className="text-block ml-2 flex-auto text-left">
                          {t('chapters:FinishedChapter')}
                        </div>
                        <div className="icon-block flex-grow-0">
                          <div className=" border-2 border-amber-500 rounded-full p-2">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-block ml-2 flex-auto text-left">
                          {t('chapters:CancelFinishedChapter')}
                        </div>
                        <div className="icon-block flex-grow-0">
                          <div className="border-2 border-red-500 rounded-full p-2">
                            <Trash className="w-5 h-5" />
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
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
