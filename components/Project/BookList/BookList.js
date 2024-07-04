import { useEffect, useState, Fragment } from 'react'

import { useRouter } from 'next/router'

import { Tab } from '@headlessui/react'

import { useTranslation } from 'next-i18next'

import Testament from './Testament'
import BookProperties from './BookProperties/BookProperties'

import { useGetBooks } from 'utils/hooks'

import { oldTestamentList, newTestamentList } from 'utils/config'

function BookList({ user, project, access }) {
  const { t } = useTranslation()
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
    <div className="flex flex-col gap-7">
      <div className="flex sm:hidden flex-col gap-7">
        <Tab.Group>
          {user &&
            project &&
            (!propertiesBook ? (
              <>
                <Tab.List className="flex p-1 w-full bg-th-secondary-10 rounded-3xl shadow">
                  {testaments[project?.type]?.map((testament) => (
                    <Tab
                      as={Fragment}
                      key={testament.title}
                      disabled={project?.type === 'obs'}
                    >
                      {({ selected }) => (
                        <div
                          className={`w-full rounded-3xl p-2 text-center cursor-pointer ${
                            project?.type === 'obs'
                              ? 'bg-th-secondary-10 cursor-default'
                              : selected
                              ? 'bg-th-primary-100 text-th-text-secondary-100'
                              : ''
                          }
                      `}
                        >
                          {t(testament.title)}
                        </div>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="card bg-th-secondary-10">
                  {testaments?.[project?.type]?.map((testament) => (
                    <Tab.Panel
                      key={testament.title}
                      className={`w-full ${
                        testaments?.[project?.type]?.length === 2 ? 'sm:w-1/2' : ''
                      }`}
                    >
                      <Testament
                        bookList={testament.books}
                        title={testament.title}
                        project={project}
                        access={access}
                        setCurrentBook={setCurrentBook}
                      />
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
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
            ))}
        </Tab.Group>
      </div>
      <div
        className={`hidden sm:flex sm:flex-row gap-7 h-full ${
          !currentBook && propertiesBook ? '' : 'card bg-th-secondary-10'
        }`}
      >
        {user &&
          project &&
          (!propertiesBook ? (
            <>
              <div className="flex flex-row w-full">
                {testaments?.[project?.type]?.map((testament) => (
                  <div
                    key={testament.title}
                    className={
                      testaments?.[project?.type]?.length === 2
                        ? 'w-full sm:w-1/2'
                        : 'w-full'
                    }
                  >
                    <Testament
                      bookList={testament.books}
                      title={testament.title}
                      project={project}
                      access={access}
                      setCurrentBook={setCurrentBook}
                    />
                  </div>
                ))}
              </div>
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
          ))}
      </div>
    </div>
  )
}

export default BookList
