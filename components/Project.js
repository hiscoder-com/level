import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'

import Modal from './Modal'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
import Eye from '../public/eye-icon.svg'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common', 'books'])
  const [level, setLevel] = useState('user')
  const [language, setLanguage] = useState()
  const [books, setBooks] = useState()
  const [project, setProject] = useState()
  const [creatingBook, setCreatingBook] = useState(false)
  const highLevelAccess = ['admin', 'coordinator'].includes(level)
  const { user } = useCurrentUser()

  useEffect(() => {
    const getProject = async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select()
        .eq('code', code)
        .single()
      setProject(project)
    }
    getProject()
  }, [code])

  useEffect(() => {
    const getBooks = async () => {
      const { data: books, error } = await supabase
        .from('books')
        .select('id,code,chapters')
        .eq('project_id', project.id)
      setBooks(books)
    }
    if (project?.id) {
      getBooks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, creatingBook])

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user?.id,
        project_id: project.id,
      })
      setLevel(level.data)
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

  const [translators] = useTranslators({
    token: user?.access_token,
    code: code,
  })

  useEffect(() => {
    const getLanguage = async () => {
      const { data: language, error } = await supabase
        .from('languages')
        .select('orig_name,code')
        .eq('id', project?.language_id)
        .maybeSingle()
      setLanguage(language)
    }
    if (project?.id) {
      getLanguage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  return (
    <>
      <h3 className="h3 inline-block">{project?.title}</h3>
      {highLevelAccess && (
        <div className="mt-4 ml-4 inline-block">
          <Link href={`/projects/${project?.code}/edit`}>
            <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
          </Link>
        </div>
      )}
      <div className="mt-4">
        {t('Code')} <b>{project?.code}</b>
      </div>
      <div>
        {t('Language')}{' '}
        {language && <b>{language?.orig_name + ' (' + language?.code + ')'}</b>}
      </div>
      <div className="mt-4 mb-4">
        {translators && Object.keys(translators).length > 0 && (
          <>
            {t('Translators')}:
            {translators.map((el, key) => {
              return (
                <div className="font-bold" key={key}>
                  {`${el.users.login} ${el.users.email}`}
                  {el.is_moderator ? '(Moderator)' : ''}
                </div>
              )
            })}
          </>
        )}
      </div>
      <BookList
        books={books}
        highLevelAccess={highLevelAccess}
        project={project}
        setCreatingBook={setCreatingBook}
        creatingBook={creatingBook}
        user={user}
      />
    </>
  )
}

export default Project

function BookList({
  books,
  highLevelAccess,
  project,
  setCreatingBook,
  creatingBook,
  user,
}) {
  const { t } = useTranslation(['common', 'books'])
  const { replace, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      setSelectedBook(book)
      return
    }
    setSelectedBook(null)
  }, [query, books])

  return (
    <>
      {!selectedBook ? (
        <>
          <table className="shadow-md text-sm text-center table-auto text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="py-3 px-6">{t('NameBook')}</th>
                <th className="py-3 px-6">{t('CountChapters')}</th>
              </tr>
            </thead>
            <tbody>
              {books?.map((book, index) => {
                return (
                  <tr
                    key={index}
                    onClick={() => {
                      replace({
                        pathname: `/projects/${project?.code}`,
                        query: { book: book?.code },
                        shallow: true,
                      })
                    }}
                    className="cursor-pointer hover:bg-cyan-50 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th className="py-4 px-6">{t(`books:${book?.code}`)}</th>
                    <td className="py-4 px-6">{Object.keys(book?.chapters)?.length} </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <BookCreate
            selectedBook={selectedBook}
            project={project}
            highLevelAccess={highLevelAccess}
            books={books}
            setCreatingBook={setCreatingBook}
            creatingBook={creatingBook}
            user={user}
          />
        </>
      ) : (
        <ChapterList
          selectedBook={selectedBook}
          project={project}
          highLevelAccess={highLevelAccess}
        />
      )}
    </>
  )
}

function ChapterList({ selectedBook, project, highLevelAccess }) {
  const [openModal, setOpenModal] = useState(false)
  const { query, push } = useRouter()
  const { code } = query
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [createdChapters, setCreatedChapters] = useState([])
  const [currentSteps, setCurrentSteps] = useState(null)

  const { t } = useTranslation(['common'])

  const handleCreate = async (chapter_id, num) => {
    const res = await supabase.rpc('create_verses', { chapter_id })
    if (res.data) {
      push('/projects/' + code + '/books/' + selectedBook.code + '/' + num)
    }
  }
  useEffect(() => {
    const getCreatedChapters = async () => {
      const { data: createdChaptersRaw, error } = await supabase
        .from('verses')
        .select('chapter_id')
        .eq('project_id', project.id)
        .in(
          'chapter_id',
          chapters.map((el) => el.id)
        )
      const createdChapters = new Set(createdChaptersRaw.map((el) => el.chapter_id))
      setCreatedChapters([...createdChapters])
    }
    if (project?.id && chapters?.length) {
      getCreatedChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters?.length, project?.id])
  useEffect(() => {
    supabase
      .rpc('get_current_steps', { project_id: project.id })
      .then((res) => setCurrentSteps(res.data))
  }, [project?.id])
  useEffect(() => {
    const getChapters = async () => {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('id,num,verses,text,started_at,finished_at')
        .eq('project_id', project.id)
        .eq('book_id', selectedBook.id)
      setChapters(chapters)
    }
    if (project?.id && selectedBook?.id) {
      getChapters()
    }
  }, [selectedBook?.id, project?.id])

  const getCurrentStep = (chapter, index) => {
    const step = currentSteps?.find((step) => step.chapter === chapter.num)
    if (step) {
      return (
        <Link
          key={index}
          href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
        >
          <a onClick={(e) => e.stopPropagation()} className="btn btn-white mt-2">
            {step.title}
          </a>
        </Link>
      )
    }
  }
  return (
    <div className="overflow-x-auto relative">
      <div className="my-4">
        <Link href={`/projects/${project.code}`}>
          <a onClick={(e) => e.stopPropagation()} className="text-blue-450 decoration-2 ">
            {project.code}
          </a>
        </Link>
        /{t(`books:${selectedBook.code}`)}
      </div>
      <table className="shadow-md mb-4 text-center w-fit text-sm table-auto text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="py-3 px-3">{t('Chapter')}</th>
            <th className="py-3 px-3">{t('Started')}а</th>
            <th className="py-3 px-3 ">{t('Finished')}а</th>
            <th className="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody>
          {chapters
            ?.sort((a, b) => a.num - b.num)
            .map((el, index) => {
              return (
                <tr
                  key={index}
                  onClick={() => {
                    if (highLevelAccess) {
                      if (!createdChapters.includes(el.id)) {
                        setSelectedChapter(el)
                        setOpenModal(true)
                      } else {
                        push(
                          '/projects/' +
                            project?.code +
                            '/books/' +
                            selectedBook?.code +
                            '/' +
                            el.num
                        )
                      }
                    }
                  }}
                  className={`${
                    highLevelAccess ? 'cursor-pointer hover:bg-cyan-50' : ''
                  } ${
                    !createdChapters.includes(el.id) ? 'bg-gray-100' : 'bg-white'
                  } border-b dark:bg-gray-800 dark:border-gray-700`}
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {el.num}
                  </th>
                  <td className="py-4 px-6">
                    {el.started_at && new Date(el.started_at).toLocaleString('ru', {})}
                  </td>
                  <td className="py-4 px-6 ">
                    {el.finished_at && new Date(el.finished_at).toLocaleString('ru', {})}
                  </td>

                  <td className="py-4 px-6">
                    {el.finished_at ? (
                      <div className="flex justify-center ">
                        <div
                          className="p-2 hover:bg-cyan-100 rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye />
                        </div>
                      </div>
                    ) : (
                      getCurrentStep(el, index)
                    )}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <Modal
        isOpen={openModal}
        closeHandle={() => {
          setOpenModal(false)
        }}
      >
        <div className="text-center mb-4">
          {t('WantCreateChapter')} {selectedChapter?.num}?
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setOpenModal(false)
              handleCreate(selectedChapter.id, selectedChapter.num)
            }}
            className="btn-cyan"
          >
            {t('Create')}
          </button>
          <div className="ml-4">
            <button
              className="btn-cyan"
              onClick={() => {
                setOpenModal(false)
              }}
            >
              {t('common:Close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function BookCreate({
  highLevelAccess,
  project,
  books,
  setCreatingBook,
  creatingBook,
  user,
}) {
  const [selectedBook, setSelectedBook] = useState('')
  const { push } = useRouter()
  const { t } = useTranslation(['common'])

  useEffect(() => {
    const defaultVal = project?.base_manifest?.books?.filter(
      (el) => !books?.map((el) => el.code)?.includes(el.name)
    )?.[0]?.name
    if (defaultVal) {
      setSelectedBook(defaultVal)
    }
  }, [books, project?.base_manifest?.books])

  const handleCreate = async () => {
    setCreatingBook(true)
    const book = project?.base_manifest?.books.find((el) => el.name === selectedBook)
    if (!book) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    try {
      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code: selectedBook,
        })
        .then((res) => {
          setCreatingBook(false)
          if (res.status === 201) {
            push({
              pathname: `/projects/${project?.code}`,
              query: { book: selectedBook },
              shallow: true,
            })
          }
        })
    } catch (error) {
      console.log(error)
      setCreatingBook(false)
    }
  }

  return (
    <>
      {highLevelAccess && (
        <>
          <h3 className="mt-4 ">{t('CreateBook')}</h3>
          <div className="mt-4 pb-4">
            <select
              className="input max-w-xs"
              onChange={(e) => setSelectedBook(e.target.value)}
              value={selectedBook}
            >
              {project?.base_manifest?.books
                ?.filter((el) => !books?.map((el) => el.code)?.includes(el.name))
                .map((el) => (
                  <option value={el.name} key={el.name}>
                    {t(`books:${el.name}`)}
                  </option>
                ))}
            </select>
            <button
              className="btn btn-cyan ml-2"
              onClick={() => {
                handleCreate()
              }}
              disabled={creatingBook}
            >
              {t('Create')}
            </button>
          </div>
        </>
      )}
    </>
  )
}
