import { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Disclosure } from '@headlessui/react'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import { calculateRtlDirection } from '@texttree/notepad-rcl'

import Modal from 'components/Modal'

import MenuButtons from '../UI/MenuButtons'

import { useCurrentUser } from 'lib/UserContext'

import { removeCacheNote, saveCacheNote } from 'utils/helper'
import { useAccess, useAllWords, useProject } from 'utils/hooks'

import ArrowDown from 'public/icons/arrow-down.svg'
import ArrowLeft from 'public/icons/arrow-left.svg'
import ArrowRight from 'public/icons/arrow-right.svg'
import Close from 'public/icons/close.svg'
import Export from 'public/icons/export.svg'
import Import from 'public/icons/import.svg'
import Back from 'public/icons/left.svg'
import Plus from 'public/icons/plus.svg'
import Trash from 'public/icons/trash.svg'

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
  const [termDirection, setTermDirection] = useState('ltr')
  const [titleDirection, setTitleDirection] = useState('ltr')

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

  const classNameButtonIcon = `flex items-center gap-2.5 py-1 pl-2.5`
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

  useEffect(() => {
    if (activeWord?.title) {
      setTitleDirection(calculateRtlDirection(activeWord.title))
    }
  }, [activeWord?.title])

  return (
    <div className="relative">
      <div className="flex w-full items-start gap-4">
        {isModeratorAccess && (
          <div className="w-full">
            <div className="flex w-full gap-2 rtl:flex-row-reverse">
              <div className="relative mb-3 flex grow items-center" dir={termDirection}>
                <input
                  disabled={!!activeWord}
                  className="input-primary h-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setTermDirection(calculateRtlDirection(e.target.value))
                    setCurrentPageWords(0)
                    setSearchQuery(e.target.value)
                  }}
                  placeholder={t('common:Search')}
                />
                {searchQuery && (
                  <button
                    disabled={!!activeWord}
                    onClick={getAll}
                    className="р-6 absolute z-10 w-6 cursor-pointer disabled:cursor-auto disabled:opacity-70 ltr:right-1 rtl:left-1"
                  >
                    <Close />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!!activeWord}
                  className={`btn-tertiary mb-3 p-3 ${!!activeWord ? 'opacity-70' : ''}`}
                  onClick={addNote}
                  title={t('common:AddWord')}
                >
                  <Plus className="h-6 w-6 stroke-th-text-secondary-100 stroke-2" />
                </button>
                <MenuButtons
                  disabled={!!activeWord}
                  classNames={dropMenuClassNames}
                  menuItems={dropMenuItems}
                />
              </div>
            </div>
            <div>
              <Disclosure defaultOpen>
                {({ open }) => (
                  <>
                    <Disclosure.Panel>
                      <Alphabet
                        disabled={!!activeWord}
                        alphabet={alphabetProject}
                        getAll={getAll}
                        setSearchQuery={setSearchQuery}
                        setCurrentPageWords={setCurrentPageWords}
                        t={t}
                      />
                    </Disclosure.Panel>
                    <Disclosure.Button className="w-full text-th-secondary-300">
                      <div className="mb-4 flex w-full flex-col items-center justify-center">
                        <div className="mb-3 h-px w-full bg-gray-450" />
                        <div className="flex gap-2">
                          <p>{t('common:Symbols')}</p>
                          <ArrowDown
                            className={`h-5 w-5 stroke-gray-450 ${
                              open ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </Disclosure.Button>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        )}
      </div>
      {!activeWord ? (
        <>
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
                  item: 'flex w-full rounded-lg cursor-pointer group hover:bg-th-secondary-100',
                  title: 'font-bold p-2 mr-4 flex',
                  text: 'px-2 h-10 overflow-hidden',
                  delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
                  titleBlock: 'flex justify-between items-center w-full',
                }}
                isShowDelBtn={isModeratorAccess}
                delBtnChildren={<Trash className="h-4 w-4 stroke-th-text-primary" />}
              />
              {totalPageCount > 1 && (
                <div className="bottom-0 left-0 flex justify-around">
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
                    <ArrowLeft className="h-5 w-5 stroke-th-text-primary" />
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
                    <ArrowRight className="h-5 w-5 stroke-th-text-primary" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">{t('common:NoMatches')}</div>
          )}
        </>
      ) : (
        <div className="relative" dir={titleDirection}>
          <div
            className="absolute left-0 top-0 flex w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
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
              wrapper: 'flex flex-col',
              title:
                'bg-th-secondary-100 ml-12 p-2 mb-4 font-bold rounded-lg shadow-md grow',
              redactor:
                'p-4 my-4 pb-20 bg-th-secondary-100 overflow-hidden break-words rounded-lg shadow-md',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={!isModeratorAccess}
            placeholder={isModeratorAccess ? t('common:TextDescriptionWord') : ''}
            isSelectableTitle
          />
        </div>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col items-center gap-7">
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

function Alphabet({
  alphabet,
  getAll,
  setCurrentPageWords,
  setSearchQuery,
  t,
  disabled,
}) {
  const uniqueAlphabet = [...new Set(alphabet)]

  return (
    <div className="grid w-full grid-cols-12 rounded-xl bg-th-secondary-100 p-1 text-th-text-primary">
      {uniqueAlphabet &&
        uniqueAlphabet
          .sort((a, b) => a.localeCompare(b))
          .map((letter, index) => (
            <button
              key={`${letter}_${index}`}
              onClick={() => {
                setCurrentPageWords(0)
                setSearchQuery(letter.toLowerCase())
              }}
              disabled={disabled}
              className="cursor-pointer rounded-md py-1 hover:bg-th-secondary-200 disabled:cursor-auto disabled:hover:bg-th-secondary-100"
            >
              {letter}
            </button>
          ))}
    </div>
  )
}
