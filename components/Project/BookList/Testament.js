import { Fragment, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { Menu, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

import Download from '../Download'
import BookCreate from './BookCreate'
import ChecksIcon from './ChecksIcon'

import { checkBookCodeExists } from 'utils/helper'
import { useGetBooks, useGetChaptersTranslate } from 'utils/hooks'

import Reader from 'public/icons/dictionary.svg'
import DownloadIcon from 'public/icons/download.svg'
import Elipsis from 'public/icons/elipsis.svg'
import Gear from 'public/icons/gear.svg'
import Play from 'public/icons/play.svg'

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
      push({
        pathname: `/projects/${project?.code}/books/${book}`,
      })
    }
  }
  const {
    query: { code },
  } = useRouter()

  const [chapters] = useGetChaptersTranslate({ code })

  return (
    <>
      <div className="flex flex-col gap-7 sm:px-3">
        <h3 className="hidden text-2xl font-bold sm:block">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4">
          {bookList.map((book) => {
            const isBookCreated = createdBooks?.includes(book)
            return (
              <div key={book} className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-5 truncate">
                  <ChecksIcon
                    book={book}
                    project={project}
                    levelCheck={levelChecks?.[book]}
                  />
                  <div
                    className={
                      isBookCreated
                        ? 'cursor-pointer truncate text-th-text-primary'
                        : 'text-th-secondary-300'
                    }
                    onClick={() => handleOpenBook(book, isBookCreated)}
                  >
                    {t(`books:${book}`)}
                  </div>
                </div>
                <Menu as="div" className="relative flex overflow-hidden">
                  {({ open }) => (
                    <>
                      <Menu.Button className="relative flex duration-200">
                        <Elipsis className="block h-6 min-h-[1.5rem] stroke-th-text-primary transition sm:hidden" />
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
                            <Menu.Item>
                              <button>
                                <Recorder
                                  className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
                                  onClick={() =>
                                    push({
                                      pathname: `/projects/${project?.code}/books/${book}/community-audio`,
                                      shallow: true,
                                    })
                                  }
                                />
                              </button>
                            </Menu.Item>

                            {isCoordinatorAccess && isBookCreated && (
                              <Menu.Item>
                                <button>
                                  <Gear
                                    className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
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
                                    className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
                                    onClick={() => setBookCodeCreating(book)}
                                  />
                                </button>
                              </Menu.Item>
                            )}
                            {isModeratorAccess && isBookCreated && (
                              <Menu.Item>
                                <button>
                                  <DownloadIcon
                                    className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
                                    onClick={() => {
                                      setIsOpenDownloading(true)
                                      setDownloadingBook(book)
                                    }}
                                  />
                                </button>
                              </Menu.Item>
                            )}
                            {checkBookCodeExists(book, chapters) && (
                              <Menu.Item>
                                <button>
                                  <Reader
                                    className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
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
                      </Transition>
                    </>
                  )}
                </Menu>

                {!isLoading ? (
                  <>
                    <div className="hidden gap-2 sm:flex">
                      {!isBookCreated && isCoordinatorAccess && (
                        <>
                          <Play
                            className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
                            onClick={() => setBookCodeCreating(book)}
                          />
                        </>
                      )}

                      {(checkBookCodeExists(book, chapters) || levelChecks?.[book]) && (
                        <Reader
                          className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
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
                      {isModeratorAccess && isBookCreated && (
                        <DownloadIcon
                          className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
                          onClick={() => {
                            setIsOpenDownloading(true)
                            setDownloadingBook(book)
                          }}
                        />
                      )}
                      {isBookCreated && (
                        <Recorder
                          className="w-6 min-w-[1.5rem] stroke-th-text-primary cursor-pointer"
                          onClick={() =>
                            push({
                              pathname: `/projects/${project?.code}/books/${book}/community-audio`,
                              shallow: true,
                            })
                          }
                        />
                      )}
                      {isCoordinatorAccess && (
                        <>
                          {isBookCreated && (
                            <Gear
                              className="w-6 min-w-[1.5rem] cursor-pointer stroke-th-text-primary"
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
                    <div className="h-full w-full rounded-2xl bg-th-secondary-100"></div>
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
        closeHandle={() => setIsOpenDownloading(false)}
        className={{
          dialogPanel:
            'w-full max-w-md overflow-y-visible rounded-3xl bg-th-primary-100 p-6 align-middle text-th-text-secondary-100',
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
