import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useGetBooks, useGetChapters, useGetCreatedChapters } from 'utils/hooks'

import { oldTestamentList, newTestamentList } from 'utils/config'

import Testament from './Testament'
import ChapterList from './ChapterList'

function BookList({ user, project, access }) {
  const { query } = useRouter()
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
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  useEffect(() => {
    if (query?.book && books?.length) {
      const book = books?.find((book) => book.code === query?.book)
      if (book) {
        setCurrentBook(book.code)
      }
    } else {
      setCurrentBook(null)
    }
  }, [query, books, setCurrentBook])

  return (
    <div className="card flex h-full">
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

export default BookList
