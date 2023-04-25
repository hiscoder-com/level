import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import Testament from './Testament'
import ChapterList from './ChapterList'
import Download from './Download'
import BookProperties from './BookProperties/BookProperties'

import { useGetBooks } from 'utils/hooks'

import { oldTestamentList, newTestamentList } from 'utils/config'

function BookList({ user, project, access }) {
  const { query } = useRouter()
  const [currentBook, setCurrentBook] = useState(null)
  const [downloadingBook, setDownloadingBook] = useState(null)
  const [propertiesBook, setPropertiesBook] = useState(null)

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
    if (query?.download === 'book') {
      setDownloadingBook(query?.book)
      setCurrentBook(null)
    }
    if (query?.properties) {
      setPropertiesBook(query?.properties)
      setCurrentBook(null)
      return
    }
    if (query?.book) {
      setCurrentBook(query?.book)
    } else {
      setPropertiesBook(null)
      setDownloadingBook(null)
      setCurrentBook(null)
    }
  }, [query, books, setCurrentBook])
  return (
    <div className="card flex h-full">
      {downloadingBook && (
        <Download isBook project={project} bookCode={downloadingBook} books={books} />
      )}
      {currentBook && !downloadingBook && (
        <ChapterList book={currentBook} access={access} project={project} user={user} />
      )}
      {!currentBook && !downloadingBook && !propertiesBook && (
        <>
          {testaments?.[project?.type]?.map((testament) => (
            <div
              key={testament.title}
              className={`w-${
                testaments?.[project?.type]?.length === '2' ? '1/2' : 'full'
              }`}
            >
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
      {!currentBook && !downloadingBook && propertiesBook && (
        <BookProperties
          project={project}
          user={user}
          bookCode={propertiesBook}
          type={project?.type}
          mutateBooks={mutateBooks}
          books={books}
        />
      )}
    </div>
  )
}

export default BookList
