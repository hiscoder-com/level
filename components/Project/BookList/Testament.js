import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import BookCreate from './BookCreate'
import ChecksIcon from './ChecksIcon'
import Modal from 'components/Modal'
import Download from '../Download'

import { useGetBooks } from 'utils/hooks'

import Gear from '/public/gear.svg'
import Reader from '/public/dictionary.svg'
import DownloadIcon from '/public/download.svg'
import Play from '/public/play.svg'

function Testament({
  bookList,
  title,
  user,
  project,
  access: { isCoordinatorAccess, isModeratorAccess, isAdminAccess },
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

  const createdBooks = useMemo(() => books?.map((book) => book.code), [books])

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
      <div className="flex flex-col gap-7 px-3">
        <h3 className="text-2xl font-bold">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4 pr-4">
          {bookList.map((book) => {
            const isBookCreated = createdBooks?.includes(book)
            return (
              <div key={book} className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-5">
                  <ChecksIcon book={book} user={user} project={project} />
                  <div
                    className={
                      isBookCreated ? 'text-teal-500 cursor-pointer' : 'text-gray-400'
                    }
                    onClick={() => handleOpenBook(book, isBookCreated)}
                  >
                    {t(`books:${book}`)}
                  </div>
                </div>
                <div className="flex gap-2 text-darkBlue">
                  {isCoordinatorAccess && (
                    <>
                      {isBookCreated && (
                        <>
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
                        </>
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
                  <Reader className="w-6 min-w-[1.5rem]" />
                </div>
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
