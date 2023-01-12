import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'

import Modal from './Modal'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
import { readableDate } from 'utils/helper'

import Pdf from '../public/pdf.svg'
import Download from '../public/download.svg'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common', 'books', 'chapters'])
  const [level, setLevel] = useState('user')
  const [project, setProject] = useState()
  const highLevelAccess = ['admin', 'coordinator'].includes(level)
  const { user } = useCurrentUser()

  useEffect(() => {
    const getProject = async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*,languages!inner(orig_name,code)')
        .eq('code', code)
        .single()
      setProject(project)
    }
    if (code) {
      getProject()
    }
  }, [code])

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setLevel(level.data)
    }
    if (user?.id && project?.id) {
      getLevel()
    }
  }, [user?.id, project?.id])

  const [translators] = useTranslators({
    token: user?.access_token,
    code: code,
  })

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
        {project?.languages && (
          <b>{project?.languages?.orig_name + ' (' + project?.languages?.code + ')'}</b>
        )}
      </div>
      <div className="my-4">
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
      <BookList highLevelAccess={highLevelAccess} project={project} user={user} />
    </>
  )
}

export default Project

function BookList({ highLevelAccess, project, user }) {
  const { t } = useTranslation(['common', 'books'])
  const { push, query } = useRouter()
  const [selectedBook, setSelectedBook] = useState(null)
  const [books, setBooks] = useState()

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
  }, [project?.id, query?.book])

  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      setSelectedBook(book)
    } else {
      setSelectedBook(null)
    }
  }, [query, books])

  const compileBook = (book, type = 'txt') => {
    const main = ''
    if (Object.keys(book).length > 0) {
      for (const [key, value] of Object.entries(book)) {
        if (value) {
          main += ` <h1>${t('Chapter')} ${key}</h1>
          <div>${compileChapter(value, 'html')}</div>`
        }
      }
    }
    return main
  }
  const downloadPdf = (e, state) => {
    const { book } = state
    e.stopPropagation()
    if (book) {
      const title = `${t('Book')} ${t(`books:${book.code}`)}`

      const handleCreate = async () => {
        const res = await supabase.rpc('handle_compile_book', { books_id: 1 })
        const main = compileBook(res.data)
        generateHTML(main, title, project.languages.code, project.languages.title)
      }

      handleCreate()
    }
  }
  return (
    <>
      {!selectedBook ? (
        <>
          <table className="shadow-md text-sm text-center table-auto text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-6">{t('NameBook')}</th>
                <th className="py-3 px-6">{t('CountChapters')}</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {books?.map((book, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    push({
                      pathname: `/projects/${project?.code}`,
                      query: { book: book?.code },
                      shallow: true,
                    })
                  }}
                  className="cursor-pointer hover:bg-cyan-50 bg-white border-b"
                >
                  <td className="py-4 px-6">{t(`books:${book?.code}`)}</td>
                  <td className="py-4 px-6">{Object.keys(book?.chapters)?.length} </td>

                  <td className="py-4">
                    <DownloadBlock actions={{ downloadPdf }} state={{ book }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <BookCreate
            selectedBook={selectedBook}
            project={project}
            highLevelAccess={highLevelAccess}
            books={books}
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
const compileChapter = (chapter, type = 'txt') => {
  if (Object.keys(chapter).length > 0) {
    const text = Object.entries(chapter).reduce((txt, verse) => {
      if (type === 'txt') {
        return txt + `${verse[0]}. ${verse[1] || ''}\n`
      } else {
        return txt + `<sup>${verse[0]}</sup> ${verse[1] || ''} `
      }
    }, '')
    return text
  }
}
const generateHTML = (main, title = '', lang = 'en', dir = 'project') => {
  let new_window = window.open()
  new_window.document.write(`<html lang="${lang}" dir="${dir}">
  <head>
      <meta charset="UTF-8"/>
      <title>${title}</title>
      <style type="text/css">
          body > div {
              page-break-after: always;
          }
      </style>
  </head>
  <body onLoad="window.print()">
      <h1>${title}</h1>
      <div>${main}</div>
      </body>
      </html>`)
  new_window.document.close()
}

function ChapterList({ selectedBook, project, highLevelAccess }) {
  const [openModal, setOpenModal] = useState(false)
  const {
    query: { book, code },
    push,
    locale,
  } = useRouter()
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
    if (project?.id) {
      supabase
        .rpc('get_current_steps', { project_id: project.id })
        .then((res) => setCurrentSteps(res.data))
    }
  }, [project?.id])

  useEffect(() => {
    const getChapters = async () => {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('id,num,verses,started_at,finished_at,text')
        .eq('project_id', project.id)
        .eq('book_id', selectedBook.id)
      setChapters(chapters)
    }
    if (project?.id && selectedBook?.id) {
      getChapters()
    }
  }, [selectedBook?.id, project?.id])
  const getCurrentStep = (chapter, index) => {
    const step = currentSteps
      ?.filter((step) => step.book === book)
      ?.find((step) => step.chapter === chapter.num)
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

  const downloadTxt = (e, chapterJson, chapterNum) => {
    e.stopPropagation()
    if (!chapterJson) {
      return
    }
    const text = compileChapter(chapterJson)
    const element = document.createElement('a')
    const file = new Blob([text], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${selectedBook.code}_chapter${chapterNum}.txt`
    element.click()
  }
  const downloadPdf = (e, state) => {
    const {
      chapter: { text: chapterJson, num: chapterNum },
      book,
    } = state
    e.stopPropagation()
    if (!chapterJson || !book) {
      return
    }

    const main = compileChapter(chapterJson, 'html')
    const title = `${t('Book')} ${t(`books:${book.code}`)} ${t(
      'Chapter'
    ).toLowerCase()} ${chapterNum || ''}`

    generateHTML(main, title, project.languages.code, project.languages.title)
  }

  return (
    <div className="overflow-x-auto relative">
      <div className="my-4">
        <Link href={`/projects/${project.code}`}>
          <a onClick={(e) => e.stopPropagation()} className="text-blue-450 decoration-2">
            {project.code}
          </a>
        </Link>
        /{t(`books:${selectedBook.code}`)}
      </div>
      <table className="shadow-md mb-4 text-center w-fit text-sm table-auto text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="py-3 px-3">{t('Chapter')}</th>
            <th className="py-3 px-3">{t('chapters:StartedAt')}</th>
            <th className="py-3 px-3 ">{t('chapters:FinishedAt')}</th>
            <th className="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody>
          {chapters
            ?.sort((a, b) => a.num - b.num)
            .map((chapter, index) => {
              const { id, num, text, started_at, finished_at } = chapter
              return (
                <tr
                  key={index}
                  onClick={() => {
                    if (highLevelAccess) {
                      if (!createdChapters.includes(id)) {
                        setSelectedChapter(chapter)
                        setOpenModal(true)
                      } else {
                        push(
                          '/projects/' +
                            project?.code +
                            '/books/' +
                            selectedBook?.code +
                            '/' +
                            num
                        )
                      }
                    }
                  }}
                  className={`${
                    highLevelAccess ? 'cursor-pointer hover:bg-cyan-50' : ''
                  } ${
                    !createdChapters.includes(id) ? 'bg-gray-100' : 'bg-white'
                  } border-b`}
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {num}
                  </th>
                  <td className="py-4 px-6">
                    {started_at && readableDate(started_at, locale)}
                  </td>
                  <td className="py-4 px-6 ">
                    {finished_at && readableDate(finished_at, locale)}
                  </td>

                  <td className="py-4 px-6">
                    {finished_at ? (
                      <DownloadBlock
                        actions={{ downloadPdf, downloadTxt }}
                        state={{ chapter: { num, text }, book: selectedBook }}
                      />
                    ) : (
                      getCurrentStep(chapter, index)
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

function BookCreate({ highLevelAccess, project, books, user }) {
  const [selectedBook, setSelectedBook] = useState('')
  const [creatingBook, setCreatingBook] = useState(false)

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
    if (!book && !project.id) {
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
          if (res.status == 201) {
            push(
              {
                pathname: `/projects/${project?.code}`,
                query: { book: selectedBook },
              },
              undefined,
              { shallow: true }
            )
          }
        })
    } catch (error) {
      console.log(error)
    } finally {
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
                ?.filter(
                  (el) =>
                    !books?.map((book) => book.code)?.includes(el.name) &&
                    el.name !== 'frt'
                )
                .map((el) => (
                  <option value={el.name} key={el.name}>
                    {t(`books:${el.name}`)}
                  </option>
                ))}
            </select>
            <button
              className="btn btn-cyan ml-2"
              onClick={handleCreate}
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

function DownloadBlock({ actions = {}, state = {} }) {
  const { downloadPdf, downloadTxt } = actions
  return (
    <div className="flex justify-center ">
      <div
        className="p-2 mr-4 hover:bg-cyan-100 rounded-md"
        onClick={(e) => downloadPdf(e, state)}
      >
        <Pdf />
      </div>
      <div
        className="p-2 w-10 h-10 hover:bg-cyan-100 rounded-md"
        onClick={(e) => downloadTxt(e, state)}
      >
        <Download />
      </div>
    </div>
  )
}
