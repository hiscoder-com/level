import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import toast, { Toaster } from 'react-hot-toast'

import { removeCacheNote, saveCacheNote } from 'utils/helper'
import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'
import { useAccess, useProject } from 'utils/hooks'

import Modal from 'components/Modal'

import RightArrow from 'public/right-arrow.svg'
import LeftArrow from 'public/left-arrow.svg'
import Close from 'public/close.svg'
import Trash from 'public/trash.svg'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotes = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotes),
  {
    ssr: false,
  }
)
const CountWordsOnPage = 10

function Dictionary() {
  const [currentPageWords, setCurrentPageWords] = useState(0)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [errorText, setErrorText] = useState(false)
  const [wordToDel, setWordToDel] = useState(null)
  const [activeWord, setActiveWord] = useState()
  const [wordId, setWordId] = useState('')
  const [words, setWords] = useState(null)

  const supabase = useSupabaseClient()

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / CountWordsOnPage),
    [words]
  )

  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()

  const {
    query: { project: code },
  } = useRouter()

  const [project, { mutate }] = useProject({
    token: user?.access_token,
    code,
  })
  const [{ isModeratorAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code,
  })
  const getAll = () => {
    setCurrentPageWords(0)
    setSearchQuery('')
    getWords()
  }

  const getWords = async (searchQuery = '', count = 0) => {
    const { from, to } = getPagination(count, CountWordsOnPage)
    if (project?.id) {
      const { data, count: wordsCount } = await supabase
        .from('dictionaries')
        .select('id,project_id,title,data,deleted_at', { count: 'exact' })
        .eq('project_id', project?.id)
        .is('deleted_at', null)
        .ilike('title', `${searchQuery}%`)
        .order('title', { ascending: true })
        .range(from, to)
      if (data?.length) {
        setWords({ data, count: wordsCount })
      }
    }
  }

  useEffect(() => {
    getWords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  useEffect(() => {
    const timer = setTimeout(() => {
      getWords(searchQuery, currentPageWords)
    }, 500)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    if (!words?.data) {
      return
    }
    const currentNote = words?.data?.find((el) => el.id === wordId)
    setActiveWord(currentNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordId])

  function addNote() {
    const placeholder = t('NewWord').toLowerCase()
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/dictionaries', {
        id,
        project_id: project?.id,
        placeholder,
      })
      .then((res) => setActiveWord(res.data[0]))
      .catch((err) => showError(err, placeholder))
  }

  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/dictionaries/${id}`)
      .then(() => removeCacheNote('dictionary', id))
      .catch(console.log)
      .finally(() => getWords(searchQuery, currentPageWords))
  }

  const saveWord = async () => {
    if (!isModeratorAccess) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/dictionaries/${activeWord?.id}`, activeWord)
      .then(() => saveCacheNote('dictionary', activeWord, user))
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
      .finally(() => {
        getWords(searchQuery, currentPageWords)
        mutate()
      })
  }

  const showError = (err, placeholder) => {
    if (err?.response?.data?.error) {
      setErrorText(`${t('WordExist')} "${placeholder}"`)
    }
    setTimeout(() => {
      setErrorText(null)
    }, 2000)
  }

  const getPagination = (page, size) => {
    const from = page ? page * size : 0
    const to = page ? from + size - 1 : size - 1
    return { from, to }
  }

  useEffect(() => {
    if (!activeWord || !isModeratorAccess) {
      return
    }
    const timer = setTimeout(() => {
      saveWord()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord, isModeratorAccess])

  return (
    <div className="relative">
      {!activeWord ? (
        <>
          <div className="mr-11">
            <Alphabet
              alphabet={project?.dictionaries_alphabet}
              getAll={getAll}
              setSearchQuery={setSearchQuery}
              setCurrentPageWords={setCurrentPageWords}
              t={t}
            />
            <input
              className="input max-w-xs mt-2"
              value={searchQuery}
              onChange={(e) => {
                setCurrentPageWords(0)
                setSearchQuery(e.target.value)
              }}
            />
          </div>
          {isModeratorAccess && (
            <>
              <div className="absolute top-0 right-0">
                <button
                  className="mb-4 right-0 btn-cyan text-xl font-bold"
                  onClick={addNote}
                >
                  +
                </button>
              </div>
              <div
                className={`${
                  errorText ? 'block' : 'hidden'
                } absolute top-11 right-0 p-3 bg-red-200`}
              >
                {errorText}
              </div>
            </>
          )}
          {words?.data.length ? (
            <div className="mt-2">
              <ListOfNotes
                notes={words?.data}
                removeNote={(e) => {
                  setIsOpenModal(true)
                  setWordToDel(words?.data?.find((el) => el.id === e))
                }}
                setNoteId={setWordId}
                classes={{
                  item: 'flex justify-between items-start rounded-lg cursor-pointer group hover:bg-gray-200',
                  title: 'font-bold p-2 mr-4',
                  text: 'px-2 h-10 overflow-hidden',
                  delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
                }}
                isShowDelBtn={isModeratorAccess}
                delBtnChildren={<Trash className={'w-4 h-4 text-cyan-800'} />}
              />
              {totalPageCount > 1 && (
                <div className="flex justify-around bottom-0 left-0">
                  <button
                    className="arrow"
                    disabled={currentPageWords === 0}
                    onClick={() =>
                      setCurrentPageWords((prev) => {
                        getWords(searchQuery, prev - 1)
                        return prev - 1
                      })
                    }
                  >
                    <LeftArrow />
                  </button>
                  <button
                    className="arrow"
                    disabled={currentPageWords >= totalPageCount - 1}
                    onClick={() => {
                      setCurrentPageWords((prev) => {
                        getWords(searchQuery, prev + 1)
                        return prev + 1
                      })
                    }}
                  >
                    <RightArrow />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">{t('NoMatches')}</div>
          )}
        </>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 pr-3 w-10 cursor-pointer"
            onClick={() => {
              saveWord()
              setActiveWord(null)
              setWordId(null)
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-cyan-50 p-2 my-4 mr-12 font-bold rounded-lg shadow-md',
              redactor:
                'p-4 my-4 pb-20 bg-cyan-50 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={!isModeratorAccess}
            placeholder={isModeratorAccess ? t('TextDescriptionWord') : ''}
          />
        </>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') + ' ' + t(wordToDel?.title).toLowerCase() + '?'}
          </div>
          <div className="flex w-1/2 gap-7">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                if (wordToDel) {
                  removeNote(wordToDel.id)
                  setWordToDel(null)
                }
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setWordToDel(null)
                setIsOpenModal(false)
              }}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
      <Toaster />
    </div>
  )
}

export default Dictionary

function Alphabet({ alphabet, getAll, setCurrentPageWords, setSearchQuery, t }) {
  return (
    <div className="flex flex-wrap">
      {alphabet &&
        alphabet
          ?.sort((a, b) => a.localeCompare(b))
          .map((el) => (
            <div
              onClick={() => {
                setCurrentPageWords(0)
                setSearchQuery(el.toLowerCase())
              }}
              className="py-1 px-3 rounded-md cursor-pointer hover:bg-gray-200"
              key={el}
            >
              {el}
            </div>
          ))}
      <div
        className="py-1 px-3 rounded-md cursor-pointer hover:bg-gray-200"
        onClick={getAll}
      >
        {t('ShowAll')}
      </div>
    </div>
  )
}
