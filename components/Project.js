import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
import Download from '../public/download.svg'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common', 'books'])
  const [level, setLevel] = useState('user')
  const [books, setBooks] = useState()
  const [project, setProject] = useState()
  const [creatingBook, setCreatingBook] = useState(false)
  console.log(creatingBook)
  const { user } = useCurrentUser()
  const [selectedBook, setSelectedBook] = useState('')
  const handleCreate = async () => {
    setCreatingBook(true)
    const book = project?.base_manifest?.books.find((el) => el.name === selectedBook)
    if (!book) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    console.log({ project_id: project.id, link: book.link, book_code: selectedBook })
    try {
      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code: selectedBook,
        })
        .then(setCreatingBook(false))
    } catch (error) {
      setCreatingBook(false)

      console.log(error)
    }

    // if (res.status === 201) {
    //   push('/projects/' + code + '/books/' + selectedBook)
    // }
  }

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
      console.log(books)
      const defaultVal = project?.base_manifest?.books?.filter(
        (el) => !books?.map((el) => el.code)?.includes(el.name)
      )?.[0]?.name
      if (defaultVal) {
        setSelectedBook(defaultVal)
      }
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

  const highLevelAccess = ['admin', 'coordinator'].includes(level)
  return (
    <div className="">
      <h3 className="h3 inline-block">{project?.title}</h3>
      {highLevelAccess && (
        <div className="mt-4 ml-4 inline-block">
          <Link href={`/projects/${project?.code}/edit`}>
            <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
          </Link>
          <br />
        </div>
      )}
      <div className="mt-4">
        {t('Code')} <b>{project?.code}</b>
      </div>
      <div>
        {t('Language')}{' '}
        {project?.languages && (
          <b>{project?.languages?.orig_name + ' (' + project?.languages?.code + ')'}</b>
        )}
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
        creatingBook={creatingBook}
        books={books}
        highLevelAccess={highLevelAccess}
        project={project}
      />

      {highLevelAccess && (
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
            className="btn btn-cyan"
            onClick={() => {
              handleCreate()
            }}
            disabled={creatingBook}
          >
            {t('Create')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Project

import { useRouter } from 'next/router'
import axios from 'axios'
import Modal from './Modal'

function BookList({ creatingBook, books, highLevelAccess, project }) {
  const [selectedBook, setSelectedBook] = useState(null)
  return (
    <>
      {!selectedBook ? (
        <table className="w-fit text-sm text-left table-auto text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">
                Название
              </th>
              <th scope="col" className="py-3 px-6">
                Количество глав
              </th>
              <th scope="col" className="py-3 px-6 hidden sm:block">
                Прогресс
              </th>

              <th scope="col" className="py-3 px-6">
                Скачать
              </th>
            </tr>
          </thead>
          <tbody>
            {books?.map((el, index) => {
              return (
                <tr
                  key={index}
                  onClick={() => {
                    setSelectedBook(el)
                  }}
                  className="cursor-pointer hover:bg-cyan-50 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="w-8">{el.code}</div>
                  </th>
                  <td className="py-4 px-6">{Object.keys(el.chapters).length}</td>
                  <td className="py-4 px-6 hidden sm:block">{'0%'}</td>

                  <td className="py-4 px-6">
                    <div className="w-6 h-6 text-center">
                      <Download
                        className="hover:bg-cyan-200 rounded-md "
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('download')
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <>
          <div className="btn-cyan" onClick={() => setSelectedBook(null)}>
            Back
          </div>
          <ChapterList
            selectedBook={selectedBook}
            project={project}
            highLevelAccess={highLevelAccess}
          />
        </>
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
  // const [currentSteps, setCurrentSteps] = useState(null)
  // useEffect(() => {
  //   supabase
  //     .rpc('get_current_steps', { project_id: project.id })
  //     .then((res) => setCurrentSteps(res.data))
  // }, [project?.id])

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

  return (
    <div className="overflow-x-auto relative">
      <div>{selectedBook.code}</div>
      <table className="w-fit text-sm text-left table-auto text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              Номер главы
            </th>
            <th scope="col" className="py-3 px-6">
              Начата
            </th>
            <th scope="col" className="py-3 px-6 hidden sm:block">
              Закончена
            </th>

            <th scope="col" className="py-3 px-6">
              Скачать
            </th>
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
                  }  border-b dark:bg-gray-800 dark:border-gray-700`}
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="w-8">{el.num}</div>
                  </th>
                  <td className="py-4 px-6">{el.started_at}</td>
                  <td className="py-4 px-6 hidden sm:block">{el.finished_at}</td>

                  <td className="py-4 px-6">d</td>
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
          Вы хотите создать {selectedChapter?.num} главу?
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
