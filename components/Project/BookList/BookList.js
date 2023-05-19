import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import Testament from './Testament'
import BookProperties from './BookProperties/BookProperties'

import { useGetBooks } from 'utils/hooks'

import { oldTestamentList, newTestamentList } from 'utils/config'

function BookList({ user, project, access }) {
  const { query } = useRouter()
  const [currentBook, setCurrentBook] = useState(null)
  const [propertiesBook, setPropertiesBook] = useState(null)

  const testaments = {
    bible: [
      { title: 'OldTestament', books: Object.keys(oldTestamentList) },
      { title: 'NewTestament', books: Object.keys(newTestamentList) },
    ],
    obs: [{ title: 'OpenBibleStories', books: ['obs'] }],
  }
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  useEffect(() => {
    if (query?.properties) {
      setPropertiesBook(query?.properties)
    } else {
      setPropertiesBook(null)
      setCurrentBook(null)
    }
  }, [query, books, setCurrentBook])
  return (
    <div
      className={`flex flex-col sm:flex-row gap-7 h-full ${
        !currentBook && propertiesBook ? '' : 'card'
      }`}
    >
      {user && project ? (
        !propertiesBook ? (
          <>
            {testaments?.[project?.type]?.map((testament) => (
              <div
                key={testament.title}
                className={
                  testaments?.[project?.type]?.length === 2 ? 'w-full sm:w-1/2' : 'w-full'
                }
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
        ) : (
          <BookProperties
            project={project}
            user={user}
            bookCode={propertiesBook}
            type={project?.type}
            mutateBooks={mutateBooks}
            books={books}
          />
        )
      ) : (
        <>
          {/* {[...Array(2).keys()].map((testament) => (
            <div key={testament} className="flex flex-col gap-4 w-full">
              {[...Array(33).keys()].map((book) => (
                <div className="h-4 animate-pulse" key={book}>
                  <div className="h-full w-full bg-gray-200 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ))} */}
        </>
      )}
      {/* {!currentBook && propertiesBook && (
        <BookProperties
          project={project}
          user={user}
          bookCode={propertiesBook}
          type={project?.type}
          mutateBooks={mutateBooks}
          books={books}
        />
      )} */}
    </div>
  )
}

export default BookList
