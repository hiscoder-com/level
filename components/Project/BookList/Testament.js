import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu } from '@headlessui/react'

import BookCreate from './BookCreate'
import ChecksIcon from './ChecksIcon'
import Modal from 'components/Modal'
import Download from '../Download'

import { useGetBooks } from 'utils/hooks'

import Gear from '/public/gear.svg'
import Reader from '/public/dictionary.svg'
import DownloadIcon from '/public/download.svg'
import Play from '/public/play.svg'
import Elipsis from '/public/elipsis.svg'

function Testament({
  bookList,
  title,
  user,
  project,
  access: { isCoordinatorAccess, isModeratorAccess, isAdminAccess, isLoading },
  setCurrentBook,
}) {
  const { t } = useTranslation('books')
  const { push } = useRouter()

  const [bookCodeCreating, setBookCodeCreating] = useState(null)
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [downloadingBook, setDownloadingBook] = useState(null)
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  const levelChecks = useMemo(() => {
    if (books) {
      const _books = {}
      books.forEach((book) => {
        _books[book.code] = book.level_checks
      })
      return _books
    }
  }, [books])

  const createdBooks = useMemo(() => books?.map((book) => book.code), [books])
  const finishedBooks = useMemo(
    () =>
      books?.filter((book) => book?.level_checks?.level === 3).map((book) => book.code),
    [books]
  )

  const handleOpenBook = (book, isBookCreated) => {
    if (isBookCreated && book) {
      setCurrentBook(book)
      push({
        pathname: `/projects/${project?.code}/books/${book}`,
      })
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7 sm:px-3">
        <h3 className="hidden sm:block text-2xl font-bold">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4">
          {bookList.map((book) => {
            const isBookCreated = createdBooks?.includes(book)
            const isBookFinished = finishedBooks?.includes(book)
            return (
              <div key={book} className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-5">
                  <ChecksIcon
                    book={book}
                    user={user}
                    project={project}
                    levelCheck={levelChecks?.[book]}
                  />
                  <div
                    className={
                      isBookFinished
                        ? 'text-slate-600 cursor-pointer'
                        : isBookCreated
                        ? 'text-teal-500 cursor-pointer'
                        : 'text-gray-400'
                    }
                    onClick={() => handleOpenBook(book, isBookCreated)}
                  >
                    {t(`books:${book}`)}
                  </div>
                </div>
                <Menu as="div" className="relative">
                  <Menu.Button>
                    <Elipsis className="block sm:hidden h-6 min-h-[1.5rem]" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-5 top-0 bg-white z-20 border rounded-3xl">
                    <div className="flex flex-col last:rounded-b-3xl">
                      {isCoordinatorAccess && isBookCreated && (
                        <Menu.Item>
                          <button className="p-3 hover:bg-slate-200 first:rounded-t-3xl last:rounded-b-3xl">
                            <Gear
                              className="w-6 min-w-[1.5rem] cursor-pointer"
                              onClick={() =>
                                push({
                                  pathname: `/projects/${project?.code}`,
                                  query: {
                                    properties: book,
                                  },
                                  shallow: true,
                                })
                              }
                            />
                          </button>
                        </Menu.Item>
                      )}
                      {!isBookCreated && isAdminAccess && (
                        <Menu.Item>
                          <button className="p-3 hover:bg-slate-200 first:rounded-t-3xl last:rounded-b-3xl">
                            <Play
                              className="w-6 min-w-[1.5rem] cursor-pointer"
                              onClick={() => setBookCodeCreating(book)}
                            />
                          </button>
                        </Menu.Item>
                      )}
                      {isModeratorAccess && isBookCreated && (
                        <Menu.Item>
                          <button className="p-3 hover:bg-slate-200 first:rounded-t-3xl last:rounded-b-3xl">
                            <DownloadIcon
                              className="w-6 min-w-[1.5rem] cursor-pointer"
                              onClick={() => {
                                setIsOpenDownloading(true)
                                setDownloadingBook(book)
                              }}
                            />
                          </button>
                        </Menu.Item>
                      )}
                      {levelChecks?.[book] && (
                        <Menu.Item>
                          <button className="p-3 hover:bg-slate-200 first:rounded-t-3xl last:rounded-b-3xl">
                            <Reader
                              className="w-6 min-w-[1.5rem] cursor-pointer"
                              onClick={() =>
                                push({
                                  pathname: `/projects/${project?.code}/books/read`,
                                  query: {
                                    bookid: book,
                                  },
                                  shallow: true,
                                })
                              }
                            />
                          </button>
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Menu>
                {!isLoading ? (
                  <>
                    <div className="hidden sm:flex gap-2">
                      {isCoordinatorAccess && (
                        <>
                          {isBookCreated && (
                            <Gear
                              className="w-6 min-w-[1.5rem] cursor-pointer"
                              onClick={() =>
                                push({
                                  pathname: `/projects/${project?.code}`,
                                  query: {
                                    properties: book,
                                  },
                                  shallow: true,
                                })
                              }
                            />
                          )}
                        </>
                      )}
                      {!isBookCreated && isAdminAccess && (
                        <>
                          <Play
                            className="w-6 min-w-[1.5rem] cursor-pointer"
                            onClick={() => setBookCodeCreating(book)}
                          />
                        </>
                      )}
                      {isModeratorAccess && isBookCreated && (
                        <DownloadIcon
                          className="w-6 min-w-[1.5rem] cursor-pointer"
                          onClick={() => {
                            setIsOpenDownloading(true)
                            setDownloadingBook(book)
                          }}
                        />
                      )}
                      {levelChecks?.[book] && (
                        <Reader
                          className="w-6 min-w-[1.5rem] cursor-pointer"
                          onClick={() =>
                            push({
                              pathname: `/projects/${project?.code}/books/read`,
                              query: {
                                bookid: book,
                              },
                              shallow: true,
                            })
                          }
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div role="status" className="h-4 w-1/4 animate-pulse">
                    <div className="h-full bg-gray-200 rounded-2xl w-full"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <BookCreate
        setBookCodeCreating={setBookCodeCreating}
        bookCode={bookCodeCreating}
        project={project}
        user={user}
        mutateBooks={mutateBooks}
      />

      <Modal
        isOpen={isOpenDownloading}
        closeHandle={setIsOpenDownloading}
        additionalClasses="overflow-y-visible"
      >
        <Download
          isBook
          user={user}
          project={project}
          bookCode={downloadingBook}
          books={books}
          setIsOpenDownloading={setIsOpenDownloading}
        />
      </Modal>
    </>
  )
}

export default Testament
