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
import MenuButtons from '../UI/MenuButtons'

import ArrowRight from 'public/arrow-right.svg'
import ArrowLeft from 'public/arrow-left.svg'
import Back from 'public/left.svg'
import Trash from 'public/trash.svg'
import Plus from 'public/plus.svg'
import Export from 'public/export.svg'
import Import from 'public/import.svg'
import Close from 'public/close.svg'

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

function Dictionary({ config }) {
  const [currentPageWords, setCurrentPageWords] = useState(0)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [wordToDel, setWordToDel] = useState(null)
  const [activeWord, setActiveWord] = useState()
  const [wordId, setWordId] = useState('')
  const [words, setWords] = useState(null)
  const isRtl = config?.isRtl || false

  const { t } = useTranslation(['common, error'])
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

  const countWordsOnPage = 10

  const queryWords = {
    searchQuery: '',
    wordsPerPage: countWordsOnPage,
    pageNumber: -1,
    project_id_param: project?.id,
  }

  const [allWords, { mutate }] = useAllWords(queryWords)

  const totalPageCount = useMemo(
    () => Math.ceil(words?.count / countWordsOnPage),
    [words]
  )

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
            wordsPerPage: countWordsOnPage,
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
          setWords({ data, count: data[0].total_records })
        } else {
          setWords({ data: null, count: 0 })
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
    const currentNote = words?.data?.find((letter) => letter.id === wordId)
    if (currentNote) {
      setActiveWord(currentNote)
    }
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
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.addEventListener('change', async (event) => {
      try {
        const file = event.target.files[0]
        if (!file) {
          throw new Error(t('error:NoFileSelected'))
        }

        const fileContents = await file.text()

        if (!fileContents.trim()) {
          throw new Error(t('error:EmptyFileContent'))
        }

        const importedData = JSON.parse(fileContents)
        if (importedData.type !== 'dictionary') {
          throw new Error(t('error:ContentError'))
        }

        for (const word of importedData.data) {
          const newWord = {
            id: generateUniqueId(allWords),
            project_id: project?.id,
            title: checkAndAppendNewTitle(word.title, allWords),
            data: word.data,
            created_at: word.created_at,
            changed_at: word.changed_at,
            deleted_at: word.deleted_at,
          }

          bulkNode(newWord)
        }
        getAll()
        mutate()
        mutateProject()
        setAlphabetProject(project?.dictionaries_alphabet)
      } catch (error) {
        toast.error(error.message)
      }
    })

    fileInput.click()
  }

  function exportWords() {
    try {
      if (!allWords || !allWords.length) {
        throw new Error(t('error:NoData'))
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

      const jsonString = JSON.stringify({ type: 'dictionary', data }, null, 2)

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
    } catch (error) {
      toast.error(error.message)
    }
  }

  function checkAndAppendNewTitle(title, allWords) {
    const existingTitles = allWords?.map((word) => word.dict_title.toLowerCase())
    let newTitle = title

    do {
      newTitle += '_new'
    } while (existingTitles?.includes(newTitle))
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
    const placeholder = checkAndAppendNewTitle(
      t('common:NewWord').toLowerCase(),
      allWords
    )
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
        mutateProject()
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
        toast.error(t('common:SaveFailed'))
        console.log(err)
      })
      .finally(() => {
        getWords(searchQuery, currentPageWords)
      })
  }

  const showError = (err, placeholder) => {
    if (err?.response?.data?.error) {
      toast.error(`${t('common:WordExist')} "${placeholder}"`)
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

  const classNameButtonIcon = `flex items-center gap-2.5 py-1 pl-2.5 ${
    isRtl ? 'pr-2' : 'pr-7'
  }`
  const menuItems = {
    menu: [
      {
        id: 'export',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Export className="w-4 stroke-2" /> {t('common:Export')}
          </span>
        ),
        action: () => exportWords(),
      },
      {
        id: 'import',
        buttonContent: (
          <span className={classNameButtonIcon}>
            <Import className="w-4 stroke-2" /> {t('common:Import')}
          </span>
        ),
        action: () => importWords(true),
      },
    ],
    container: {
      className: 'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
    },
    item: {
      className: 'cursor-pointer bg-th-secondary-100 hover:bg-th-secondary-200',
    },
  }
  const dropMenuItems = {
    dots: menuItems.menu.filter((menuItem) => menuItem.id !== 'remove'),
  }

  const dropMenuClassNames = { container: menuItems.container, item: menuItems.item }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="relative">
      {!activeWord ? (
        <>
          <div className="flex gap-4 items-start">
            {isModeratorAccess && (
              <>
                <div className="flex w-full gap-2 justify-end ltr:flex-row rtl:flex-row-reverse">
                  <button
                    className="btn-tertiary p-3"
                    onClick={addNote}
                    title={t('common:AddWord')}
                  >
                    <Plus className="w-6 h-6 stroke-th-text-secondary-100 stroke-2" />
                  </button>
                  <MenuButtons
                    classNames={dropMenuClassNames}
                    menuItems={dropMenuItems}
                  />
                </div>
              </>
            )}
          </div>
          <div>
            <Alphabet
              alphabet={alphabetProject}
              getAll={getAll}
              setSearchQuery={setSearchQuery}
              setCurrentPageWords={setCurrentPageWords}
              t={t}
              isRtl={isRtl}
            />
            <div className="relative flex items-center mt-2 ml-2">
              <input
                className="input-primary"
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPageWords(0)
                  setSearchQuery(e.target.value)
                }}
                placeholder={t('common:Search')}
              />
              {searchQuery && (
                <Close
                  className={`absolute р-6 w-6 z-10 cursor-pointer ${
                    isRtl ? 'left-1' : 'right-1 '
                  }`}
                  onClick={getAll}
                />
              )}
            </div>
          </div>

          {words?.data?.length ? (
            <div className="mt-2">
              <ListOfNotes
                notes={words?.data}
                removeNote={(e) => {
                  setIsOpenModal(true)
                  setWordToDel(words?.data?.find((letter) => letter.id === e))
                }}
                setNoteId={setWordId}
                classes={{
                  item: 'flex justify-between items-start rounded-lg cursor-pointer group hover:bg-th-secondary-100',
                  title: 'font-bold p-2 mr-4',
                  text: 'px-2 h-10 overflow-hidden',
                  delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
                }}
                isShowDelBtn={isModeratorAccess}
                delBtnChildren={<Trash className="w-4 h-4 stroke-th-text-primary" />}
                isRtl={isRtl}
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
            <div className="mt-2">{t('common:NoMatches')}</div>
          )}
        </>
      ) : (
        <>
          <div
            className="flex w-fit p-1 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100"
            onClick={() => {
              saveWord()
              setActiveWord(null)
              setWordId(null)
            }}
          >
            <Back className="w-8 stroke-th-primary-200" />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-th-secondary-100 p-2 my-4 font-bold rounded-lg shadow-md',
              redactor:
                'p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={!isModeratorAccess}
            placeholder={isModeratorAccess ? t('common:TextDescriptionWord') : ''}
            isSelectableTitle
            isRtl={isRtl}
          />
        </>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('common:AreYouSureDelete') +
              ' ' +
              wordToDel?.title.toLowerCase().slice(0, 20) +
              '...' +
              '?'}
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
              {t('common:Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setWordToDel(null)
                setIsOpenModal(false)
              }}
            >
              {t('common:No')}
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
          .map((letter, index) => (
            <div
              key={`${letter}_${index}`}
              onClick={() => {
                setCurrentPageWords(0)
                setSearchQuery(letter.toLowerCase())
              }}
              className="py-1 px-3 rounded-md cursor-pointer hover:bg-th-secondary-100"
            >
              {letter}
            </div>
          ))}
      <div
        className="py-1 px-3 rounded-md cursor-pointer hover:bg-th-secondary-100"
        onClick={getAll}
      >
        {t('common:ShowAll')}
      </div>
    </div>
  )
}
