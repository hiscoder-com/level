import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useGetBooks, useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import { oldTestamentList, newTestamentList } from 'utils/config'

import Testament from './Testament'
import ChapterList from './ChapterList'
import Download from './Download'

function BookList({ user, project, access }) {
  const { query } = useRouter()
  const [currentBook, setCurrentBook] = useState(null)
  const [downloadingBook, setDownloadingBook] = useState(null)

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
  const testaments = {
    bible: [
      { title: 'OldTestament', books: oldTestamentList },
      { title: 'NewTestament', books: newTestamentList },
    ],
    obs: [{ title: 'OpenBibleStories', books: ['obs'] }],
  }
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  useEffect(() => {
    console.log('first')
    if (query?.download === 'book') {
      setDownloadingBook(query?.book)
      setCurrentBook(null)
    }
    if (query?.download === 'chapter') {
      // setDownloadingBook(query?.book)
      // setCurrentBook(null)
    }
    if (query?.book) {
      setCurrentBook(query?.book)
    } else {
      setDownloadingBook(null)
      setCurrentBook(null)
    }
  }, [query, books, setCurrentBook])
  return (
    <div className="card flex h-full">
      {downloadingBook && <Download isBook project={project} />}
      {currentBook && !downloadingBook && (
        <ChapterList
          chapters={chapters}
          book={currentBook}
          setCurrentBook={setCurrentBook}
          createdChapters={createdChapters}
          mutate={{ mutateCreatedChapters, mutateChapters }}
          access={access}
          project={project}
        />
      )}
      {!currentBook && !downloadingBook && (
        <>
          {testaments?.[project?.type]?.map((testament) => (
            <div
              key={testament.title}
              className={`${
                testaments?.[project?.type]?.length === '2' ? 'w-1/2' : 'w-full'
              }`}
            >
              <Testament
                bookList={testament.books}
                title={testament.title}
                user={user}
                project={project}
                access={access}
                setCurrentBook={setCurrentBook}
                setDownloadingBook={setDownloadingBook}
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default BookList
