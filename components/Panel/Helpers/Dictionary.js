import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useDictionary } from 'utils/hooks'

import { supabase } from 'utils/supabaseClient'

import Close from 'public/close.svg'
import Trash from 'public/trash.svg'
import Modal from 'components/Modal'
import LeftArrow from 'public/left-arrow.svg'
import RightArrow from 'public/right-arrow.svg'

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
const CountWordsOnPage = 5

function Dictionary() {
  const [wordId, setWordId] = useState('')
  const [editable, setEditable] = useState(false)
  const [activeWord, setActiveWord] = useState()
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [wordToDel, setWordToDel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [words, setWords] = useState(null)
  const [errorText, setErrorText] = useState(false)
  const [currentPageWords, setCurrentPageWords] = useState(0)

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / CountWordsOnPage),
    [words]
  )

  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()

  const {
    query: { project: code },
  } = useRouter()
  const [project] = useProject({
    token: user?.access_token,
    code,
  })
  const getAll = () => {
    setCurrentPageWords(0)
    setSearchQuery('')
    getWords()
  }
  const getWords = async (searchQuery = '', count = 0) => {
    const { from, to } = getPagination(count, CountWordsOnPage)

    const { data, count: wordsCount } = await supabase
      .from('dictionaries')
      .select('id,project_id,title,data', { count: 'exact' })
      .eq('project_id', project?.id)
      .ilike('title', `${searchQuery}%`)
      .order('title', { ascending: true })
      .range(from, to)

    if (data?.length) {
      setWords({ data, count: wordsCount })
    }
  }

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
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setEditable(['admin', 'coordinator', 'moderator'].includes(level.data))
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

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
      .then((res) => {
        setActiveWord(res.data[0])
      })
      .catch((err) => {
        showError(err, placeholder)
      })
  }
  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/dictionaries/${id}`)
      .then()
      .catch((err) => console.log(err))
      .finally(() => {
        getWords(searchQuery, currentPageWords)
      })
  }
  const saveWord = async () => {
    if (!editable) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/dictionaries/${activeWord?.id}`, activeWord)
      .then()
      .catch((err) => showError(err, activeWord?.title))
      .finally(() => {
        getWords(searchQuery, currentPageWords)
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
    if (!activeWord || !editable) {
      return
    }
    const timer = setTimeout(() => {
      saveWord()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord, editable])

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
          {editable && (
            <div className="">
              <div className="absolute top-0 right-0 ">
                <button
                  className="btn-cyan text-xl font-bold mb-4 right-0"
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
            </div>
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
                  item: 'rounded-lg cursor-pointer flex justify-between items-start group hover:bg-blue-100/75',
                  title: 'font-bold p-2 mr-4',
                  text: 'px-2 h-10 overflow-hidden',
                  delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
                }}
                isShowDelBtn={editable}
                delBtnChildren={<Trash className={'w-4 h-4 text-cyan-800'} />}
              />
              {totalPageCount > 1 && (
                <div className="bottom-0 left-0 flex justify-around">
                  <button
                    className="arrow"
                    disabled={currentPageWords === 0}
                    onClick={() => {
                      setCurrentPageWords((prev) => {
                        getWords(searchQuery, prev - 1)
                        return prev - 1
                      })
                    }}
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
            className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
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
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md mr-12',
              redactor:
                'bg-cyan-50 pb-20 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={!editable}
            placeholder={editable ? t('TextDescriptionWord') : ''}
          />
        </>
      )}

      <Modal
        isOpen={isOpenModal}
        closeHandle={() => {
          setIsOpenModal(false)
        }}
      >
        {' '}
        <div className="text-center">
          <div className="mb-4">
            {t('AreYouSureDelete') + ' ' + t(wordToDel?.title) + '?'}
          </div>
          <button
            className="btn-cyan mx-2"
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
            className="btn-cyan mx-2"
            onClick={() => {
              setWordToDel(null)
              setIsOpenModal(false)
            }}
          >
            {t('No')}
          </button>
        </div>
      </Modal>
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
              className="py-1 px-3 rounded-md cursor-pointer hover:bg-cyan-100"
              key={el}
            >
              {el}
            </div>
          ))}
      <div
        className="py-1 px-3 rounded-md cursor-pointer hover:bg-cyan-100"
        onClick={() => {
          getAll()
        }}
      >
        {t('ShowAll')}
      </div>
    </div>
  )
}
