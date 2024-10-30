import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Tab } from '@headlessui/react'
import { useTranslation } from 'next-i18next'
import { newTestamentList, oldTestamentList } from 'utils/config'
import { useGetBooks } from 'utils/hooks'

import BookProperties from './BookProperties/BookProperties'
import Testament from './Testament'

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
      <div className="flex flex-col gap-7 sm:hidden">
        <Tab.Group>
          {user &&
            project &&
            (!propertiesBook ? (
              <>
                <Tab.List className="flex w-full rounded-3xl bg-th-secondary-10 p-1 shadow">
                  {testaments[project?.type]?.map((testament) => (
                    <Tab
                      as={Fragment}
                      key={testament.title}
                      disabled={project?.type === 'obs'}
                    >
                      {({ selected }) => (
                        <div
                          className={`w-full cursor-pointer rounded-3xl p-2 text-center ${
                            project?.type === 'obs'
                              ? 'cursor-default bg-th-secondary-10'
                              : selected
                                ? 'bg-th-primary-100 text-th-text-secondary-100'
                                : ''
                          } `}
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
        className={`hidden h-full gap-7 sm:flex sm:flex-row ${
          !currentBook && propertiesBook ? '' : 'card bg-th-secondary-10'
        }`}
      >
        {user &&
          project &&
          (!propertiesBook ? (
            <>
              <div className="flex w-full flex-row">
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
