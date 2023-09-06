import { Fragment, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Menu, Transition } from '@headlessui/react'

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
  project,
  access: { isCoordinatorAccess, isModeratorAccess, isLoading },
  setCurrentBook,
}) {
  const { t } = useTranslation('books')
  const { push } = useRouter()

  const [bookCodeCreating, setBookCodeCreating] = useState(null)
  const [isOpenDownloading, setIsOpenDownloading] = useState(false)
  const [downloadingBook, setDownloadingBook] = useState(null)

  const [books, { mutate: mutateBooks }] = useGetBooks({
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

  const handleOpenBook = (book, isBookCreated) => {
    if (isBookCreated && book) {
      setCurrentBook(book)
      setTimeout(() => {
        push({
          pathname: `/projects/${project?.code}/books/${book}`,
        })
      }, 500)
    }
  }
  return (
    <>
      <div className="flex flex-col gap-7 sm:px-3">
        <h3 className="hidden sm:block text-2xl font-bold">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4">
          {bookList.map((book) => {
            const isBookCreated = createdBooks?.includes(book)
            return (
              <div key={book} className="flex justify-between items-center gap-2">
                <div className="flex flex-1 items-center gap-5 truncate">
                  <ChecksIcon
                    book={book}
                    project={project}
                    levelCheck={levelChecks?.[book]}
                  />
                  <div
                    className={
                      isBookCreated
                        ? 'text-slate-900 cursor-pointer truncate'
                        : 'text-gray-400'
                    }
                    onClick={() => {
                      handleOpenBook(book, isBookCreated)
                    }}
                  >
                    {t(`books:${book}`)}
                  </div>
                </div>
                <Menu as="div" className="relative flex overflow-hidden">
                  {({ open }) => (
                    <>
                      <Menu.Button className="relative flex duration-200">
                        <Elipsis className="block sm:hidden h-6 min-h-[1.5rem] transition" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        show={open}
                        enter="transition-all duration-300 ease-in-out transform"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition-all duration-300 ease-in-out transform"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <Menu.Items>
                          <div className="flex gap-2">
                            {isCoordinatorAccess && isBookCreated && (
                              <Menu.Item>
                                <button className="">
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
                            {!isBookCreated && isCoordinatorAccess && (
                              <Menu.Item>
                                <button>
                                  <Play
                                    className="w-6 min-w-[1.5rem] cursor-pointer"
                                    onClick={() => setBookCodeCreating(book)}
                                  />
                                </button>
                              </Menu.Item>
                            )}
                            {isModeratorAccess && isBookCreated && (
                              <Menu.Item>
                                <button>
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
                                <button>
                                  <Reader
                                    className="w-6 min-w-[1.5rem] cursor-pointer"
                                    onClick={() => {
                                      push({
                                        pathname: `/projects/${project?.code}/books/read`,
                                        query: {
                                          bookid: book,
                                        },
                                        shallow: true,
                                      })
                                    }}
                                  />
                                </button>
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
                {!isLoading ? (
                  <>
                    <div className="hidden sm:flex gap-2">
                      {!isBookCreated && isCoordinatorAccess && (
                        <>
                          <Play
                            className="w-6 min-w-[1.5rem] cursor-pointer"
                            onClick={() => setBookCodeCreating(book)}
                          />
                        </>
                      )}

                      {levelChecks?.[book] && (
                        <Reader
                          className="w-6 min-w-[1.5rem] cursor-pointer"
                          onClick={() => {
                            push({
                              pathname: `/projects/${project?.code}/books/read`,
                              query: {
                                bookid: book,
                              },
                              shallow: true,
                            })
                          }}
                        />
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
        mutateBooks={mutateBooks}
      />

      <Modal
        isOpen={isOpenDownloading}
        closeHandle={setIsOpenDownloading}
        className={{
          dialogPanel:
            'w-full max-w-md align-middle p-6 bg-gradient-to-r from-slate-700 to-slate-600 text-blue-250 overflow-y-visible rounded-3xl',
        }}
      >
        <Download
          isBook
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
