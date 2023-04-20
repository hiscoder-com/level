import { useMemo, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { toast } from 'react-hot-toast'

import axios from 'axios'

import ChecksIcon from './ChecksIcon'

import { useGetBooks, useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import Gear from '../../public/gear.svg'
import Book from '../../public/dictionary.svg'
import Pencil from '../../public/editor-pencil.svg'
import Download from '../../public/download.svg'
import Play from '../../public/play.svg'
import Plus from '../../public/plus.svg'
import LeftArrow from '../../public/left-arrow.svg'

import { oldTestamentList, newTestamentList } from 'utils/config'
import { readableDate } from 'utils/helper'
import { supabase } from 'utils/supabaseClient'

function BookListNew({ user, project, access }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    token: user?.access_token,
    code: project?.code,
    book_code: currentBook,
  })
  const [createdChapters, { mutate: mutateCreatedChapters }] = useGetCreatedChapters({
    token: user?.access_token,
    code: project?.code,
    chapters: chapters?.map((el) => el.id),
  })
  const testaments = [
    { title: 'OldTestament', books: oldTestamentList },
    { title: 'NewTestament', books: newTestamentList },
  ]
  return (
    <div className="card flex">
      {currentBook ? (
        <ChapterList
          chapters={chapters}
          book={currentBook}
          setCurrentBook={setCurrentBook}
          createdChapters={createdChapters}
          mutate={{ mutateCreatedChapters, mutateChapters }}
          access={access}
          project={project}
        />
      ) : (
        <>
          {testaments.map((testament) => (
            <div key={testament.title} className="w-1/2">
              <Testament
                bookList={testament.books}
                title={testament.title}
                user={user}
                project={project}
                access={access}
                setCurrentBook={setCurrentBook}
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default BookListNew

function Testament({
  bookList,
  title,
  user,
  project,
  access: { isCoordinatorAccess, isModeratorAccess },
  setCurrentBook,
}) {
  const { t } = useTranslation(['books'])
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  const handleCreate = async (book_code) => {
    const book = project?.base_manifest?.books.find((el) => el.name === book_code)
    if (!book && !project.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    try {
      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code,
        })
        .then((res) => {
          if (res.status == 201) {
            alert('успешно')
            // push(
            //   {
            //     pathname: `/projects/${project?.code}`,
            //     query: { book: selectedBook },
            //   },
            //   undefined,
            //   { shallow: true }
            // )
          }
        })
    } catch (error) {
      console.log(error)
    } finally {
      // setCreatingBook(false)
      mutateBooks()
    }
  }
  const createdBooks = useMemo(() => books?.map((el) => el.code), [books])

  return (
    <div className="flex flex-col gap-7 max-h-[100vh] px-3">
      <h3 className="h3 font-bold">{title}</h3>
      <div className="flex flex-col gap-4 overflow-y-scroll px-4">
        {bookList.map((el) => {
          const isBookCreated = createdBooks?.includes(el)
          return (
            <div key={el} className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-5 h5">
                <ChecksIcon />
                <div
                  className={
                    isBookCreated ? 'text-teal-500 cursor-pointer' : 'text-gray-400'
                  }
                  onClick={() => isBookCreated && setCurrentBook(el)}
                >
                  {t(`books:${el}`)}
                </div>
              </div>
              <div className="flex gap-2 text-darkBlue">
                {isCoordinatorAccess && (
                  <>
                    {isBookCreated && (
                      <>
                        <Gear className="w-6" /> <Pencil className="w-6" />
                      </>
                    )}
                    {!isBookCreated && (
                      <Play
                        className="w-6 cursor-pointer"
                        onClick={() => handleCreate(el)}
                      />
                    )}
                  </>
                )}
                {isModeratorAccess && isBookCreated && <Download className="w-6" />}
                <Book className="w-6" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChapterList({
  chapters,
  book,
  setCurrentBook,
  createdChapters,
  mutate: { mutateCreatedChapters, mutateChapters },
  access: { isCoordinatorAccess },
  project,
}) {
  const { query: locale } = useRouter()
  const { t } = useTranslation()

  const nextChapter = useMemo(() => {
    const num =
      chapters?.length - createdChapters?.length > 0 && createdChapters?.length + 1
    return chapters?.find((chapter) => chapter.num === num)
  }, [chapters, createdChapters?.length])
  const handleAddChapter = async ({ chapter_id, num }) => {
    try {
      const res = await supabase.rpc('create_verses', { chapter_id })
      if (res.data) {
        mutateChapters()
        mutateCreatedChapters()
        push('/projects/' + code + '/books/' + selectedBook.code + '/' + num)
      }
    } catch (error) {
      toast.error(t('CreateFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-7 w-full">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setCurrentBook(null)}
      >
        <LeftArrow />
        <h3 className="h3 font-bold">{book}</h3>
      </div>
      <div className="flex flex-col gap-3 h4">
        <div className="flex px-5 py-3 rounded-xl">
          <div className="w-1/6">{t('Chapter')}</div>
          <div className="w-2/6">
            {t('chapters:StartedAt')}/{t('chapters:FinishedAt')}
          </div>
          <div className="w-3/6">{`${t('Download')} / ${t('Open')}`}</div>
        </div>
        {chapters &&
          chapters.map((chapter) => {
            const { id, started_at, finished_at, num } = chapter

            return (
              createdChapters?.includes(id) && (
                <Link href={`/projects/${project?.code}/books/${book}/${num}`}>
                  <div
                    key={id}
                    className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer"
                  >
                    <div className="w-1/6">{num}</div>
                    <div className="w-2/6">
                      {started_at && readableDate(started_at, locale)}
                      {finished_at && readableDate(finished_at, locale)}
                    </div>
                    <div className="w-3/6">{t('Download')}</div>
                  </div>
                </Link>
              )
            )
          })}
        {nextChapter && isCoordinatorAccess && (
          <div
            className="flex bg-blue-150 px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-250"
            onClick={() =>
              handleAddChapter({ chapter_id: nextChapter.id, num: nextChapter.num })
            }
          >
            <div className="w-1/6"></div>
            <div className="w-2/6"></div>
            <div className="w-3/6 flex items-center gap-2">
              <div className="w-6">
                <Plus />
              </div>
              <p>{t('AddChapter')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
0
