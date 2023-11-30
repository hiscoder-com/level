import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import toast from 'react-hot-toast'

import { removeCacheNote, saveCacheNote } from 'utils/helper'
import { useCurrentUser } from 'lib/UserContext'
import { useAccess, useAllWords, useProject } from 'utils/hooks'

import Modal from 'components/Modal'

import ArrowRight from 'public/arrow-right.svg'
import ArrowLeft from 'public/arrow-left.svg'
import Back from 'public/left.svg'
import Trash from 'public/trash.svg'
import Plus from 'public/plus.svg'
import Export from 'public/export.svg'
import Import from 'public/import.svg'

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
  const [wordToDel, setWordToDel] = useState(null)
  const [activeWord, setActiveWord] = useState()
  const [wordId, setWordId] = useState('')
  const [words, setWords] = useState(null)

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / CountWordsOnPage),
    [words]
  )

  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()

  const {
    query: { project: code },
  } = useRouter()

  const [project, { mutate: mutateProject }] = useProject({
    code,
  })
  const [{ isModeratorAccess }] = useAccess({
    user_id: user?.id,
    code,
  })

  const [alphabetProject, setAlphabetProject] = useState(project?.dictionaries_alphabet)

  const [allWords, { mutate }] = useAllWords('', CountWordsOnPage, -1, project?.id)

  useEffect(() => {
    mutate()
  }, [mutate])

  useEffect(() => {
    mutateProject()
  }, [mutateProject])

  const getAll = () => {
    setCurrentPageWords(0)
    setSearchQuery('')
    getWords()
  }

  const getWords = async (searchQuery = '', count = 0) => {
    const apiUrl = '/api/dictionaries/getWords'

    try {
      if (project?.id) {
        const response = await axios.get(apiUrl, {
          params: {
            searchQuery,
            wordsPerPage: CountWordsOnPage,
            pageNumber: count,
            project_id_param: project?.id,
          },
        })

        const dataTemp = response.data

        if (dataTemp?.length) {
          const data = dataTemp.map((word) => {
            return {
              id: word.dict_id,
              project_id: word.dict_project_id,
              title: word.dict_title,
              data: word.dict_data,
              deleted_at: word.dict_deleted_at,
              total_records: word.total_records,
            }
          })
          if (data?.length) {
            setWords({ data, count: data[0].total_records })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching words:', error)
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

  function generateUniqueId(existingIds) {
    let newId
    do {
      newId = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    } while (existingIds.includes(newId))
    return newId
  }

  const importWords = async () => {
    try {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.json'
      fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0]
        if (!file) {
          throw new Error('No file selected')
        }

        const fileContents = await file.text()
        const importedData = JSON.parse(fileContents)

        const words = importedData.map((word) => {
          return {
            id: generateUniqueId(allWords),
            project_id: project?.id,
            title: checkAndAppendNewTitle(word.title, allWords),
            data: word.data,
            created_at: word.created_at,
            changed_at: word.changed_at,
            deleted_at: word.deleted_at,
          }
        })

        console.log(words, 178)
        for (const word of words) {
          bulkNode(word)
        }
        getAll()
        mutateProject()
        setAlphabetProject(project?.dictionaries_alphabet)
      })

      fileInput.click()
    } catch (error) {
      console.error('Error importing notes:', error.message)
    }
  }

  function exportWords() {
    if (!allWords || !allWords.length) {
      console.error('No data to export')
      return
    }

    const data = allWords.map((word) => {
      return {
        title: word.dict_title,
        data: word.dict_data,
        created_at: word.dict_created_at,
        changed_at: word.dict_changed_at,
        deleted_at: word.dict_deleted_at,
      }
    })

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().split('T')[0]

    const fileName = `dictionary_${formattedDate}.json`

    link.download = fileName
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
  }

  function checkAndAppendNewTitle(title, allWords) {
    const existingTitles = allWords?.map((word) => word.dict_title.toLowerCase())
    let newTitle = title.toLowerCase()

    do {
      newTitle += '_new'
    } while (existingTitles && existingTitles.includes(newTitle))
    return newTitle
  }

  const bulkNode = (word) => {
    axios
      .post('/api/dictionaries/bulk_insert', {
        word: word,
      })
      .then(() => mutate())
      .catch(console.log)
  }

  function addNote() {
    const placeholder = checkAndAppendNewTitle(t('NewWord').toLowerCase(), allWords)
    const id = generateUniqueId(allWords)
    axios
      .post('/api/dictionaries', {
        id,
        project_id: project?.id,
        placeholder,
      })
      .then((res) => {
        setActiveWord(res.data[0])
      })
      .catch((err) => showError(err, placeholder))
  }

  const removeNote = (id) => {
    axios
      .delete(`/api/dictionaries/${id}`)
      .then(() => {
        removeCacheNote('dictionary', id)
        setWords((prevWords) => {
          return {
            ...prevWords,
            data: prevWords.data.filter((word) => word.id !== id),
            count: prevWords.count - 1,
          }
        })
        mutate()
      })
      .catch(console.log)
  }

  const saveWord = async () => {
    if (!isModeratorAccess) {
      return
    }

    axios
      .put(`/api/dictionaries/${activeWord?.id}`, activeWord)
      .then(() => {
        saveCacheNote('dictionary', activeWord, user)
        mutate()
        mutateProject()
        setAlphabetProject(project?.dictionaries_alphabet)
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
      .finally(() => {
        getWords(searchQuery, currentPageWords)
      })
  }

  const showError = (err, placeholder) => {
    if (err?.response?.data?.error) {
      toast.error(`${t('WordExist')} "${placeholder}"`)
    }
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

  useEffect(() => {
    setAlphabetProject(project?.dictionaries_alphabet)
  }, [project])

  return (
    <div className="relative">
      {!activeWord ? (
        <>
          <div className="flex gap-4 items-start">
            {isModeratorAccess && (
              <>
                <div className="flex gap-2">
                  <button
                    className="btn-tertiary p-3"
                    onClick={addNote}
                    title="Добавить заметку"
                  >
                    <Plus className="w-6 h-6 stroke-th-text-secondary stroke-2" />
                  </button>

                  <button
                    className="btn-tertiary p-3"
                    onClick={exportWords}
                    title={t('Download')}
                  >
                    <Export className="w-6 h-6 stroke-th-text-secondary stroke-2" />
                  </button>

                  <button
                    className="btn-tertiary p-3"
                    onClick={importWords}
                    title={t('Unload')}
                  >
                    <Import className="w-6 h-6 stroke-th-text-secondary stroke-2" />
                  </button>
                </div>
              </>
            )}
            <div>
              <Alphabet
                alphabet={alphabetProject}
                getAll={getAll}
                setSearchQuery={setSearchQuery}
                setCurrentPageWords={setCurrentPageWords}
                t={t}
              />
              <input
                className="input-primary max-w-xs mt-2 ml-2"
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPageWords(0)
                  setSearchQuery(e.target.value)
                }}
              />
            </div>
          </div>

          {words && words.data && words.data.length ? (
            <div className="mt-2">
              <ListOfNotes
                notes={words?.data}
                removeNote={(e) => {
                  setIsOpenModal(true)
                  setWordToDel(words?.data?.find((el) => el.id === e))
                }}
                setNoteId={setWordId}
                classes={{
                  item: 'flex justify-between items-start rounded-lg cursor-pointer group hover:bg-th-secondary-100',
                  title: 'font-bold p-2 mr-4',
                  text: 'px-2 h-10 overflow-hidden',
                  delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
                }}
                isShowDelBtn={isModeratorAccess}
                delBtnChildren={<Trash className={'w-4 h-4 stroke-th-text-primary'} />}
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
                    <ArrowLeft className="w-5 h-5 stroke-th-text-primary" />
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
                    <ArrowRight className="w-5 h-5 stroke-th-text-primary" />
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
            className="absolute top-1 right-0 pr-3 w-10 cursor-pointer"
            onClick={() => {
              saveWord()
              setActiveWord(null)
              setWordId(null)
            }}
          >
            <Back className="stroke-th-text-primary" />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-th-secondary-100 p-2 my-4 mr-12 font-bold rounded-lg shadow-md',
              redactor:
                'p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg shadow-md',
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
    </div>
  )
}

export default Dictionary

function Alphabet({ alphabet, getAll, setCurrentPageWords, setSearchQuery, t }) {
  const uniqueAlphabet = [...new Set(alphabet)]

  return (
    <div className="flex flex-wrap">
      {uniqueAlphabet &&
        uniqueAlphabet
          .sort((a, b) => a.localeCompare(b))
          .map((el, index) => (
            <div
              key={`${el}_${index}`}
              onClick={() => {
                setCurrentPageWords(0)
                setSearchQuery(el.toLowerCase())
              }}
              className="py-1 px-3 rounded-md cursor-pointer hover:bg-th-secondary-100"
            >
              {el}
            </div>
          ))}
      <div
        className="py-1 px-3 rounded-md cursor-pointer hover:bg-th-secondary-100"
        onClick={getAll}
      >
        {t('ShowAll')}
      </div>
    </div>
  )
}
