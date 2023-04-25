import { useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import BookCreate from './BookCreate'
import ChecksIcon from './ChecksIcon'
import { useGetBooks } from 'utils/hooks'

import Gear from '/public/gear.svg'
import Reader from '/public/dictionary.svg'
import Download from '/public/download.svg'
import Play from '/public/play.svg'

function Testament({
  bookList,
  title,
  user,
  project,
  access: { isCoordinatorAccess, isModeratorAccess, isAdminAccess },
  setCurrentBook,
}) {
  const { t } = useTranslation(['books'])
  const { push } = useRouter()

  const [bookCodeCreating, setBookCodeCreating] = useState(null)
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })

  const createdBooks = useMemo(() => books?.map((el) => el.code), [books])

  const handleOpenBook = (book, isBookCreated) => {
    if (isBookCreated && book) {
      setCurrentBook(book)
      push({
        pathname: `/projects/${project?.code}`,
        query: { book },
        shallow: true,
      })
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7 px-3">
        <h3 className="h3 font-bold">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4 pr-4">
          {bookList.map((el) => {
            const isBookCreated = createdBooks?.includes(el)
            return (
              <div key={el} className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-5 h5">
                  <ChecksIcon book={el} user={user} project={project} />
                  <div
                    className={
                      isBookCreated ? 'text-teal-500 cursor-pointer' : 'text-gray-400'
                    }
                    onClick={() => handleOpenBook(el, isBookCreated)}
                  >
                    {t(`books:${el}`)}
                  </div>
                </div>
                <div className="flex gap-2 text-darkBlue">
                  {isCoordinatorAccess && (
                    <>
                      {isBookCreated && (
                        <>
                          <Gear
                            className="w-6 cursor-pointer"
                            onClick={() =>
                              push({
                                pathname: `/projects/${project?.code}`,
                                query: {
                                  properties: el,
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
                        className="w-6 cursor-pointer"
                        onClick={() => {
                          setBookCodeCreating(el)
                          // setIsBookCreating(true)
                        }}
                      />
                    </>
                  )}
                  {isModeratorAccess && isBookCreated && (
                    <Download
                      className="w-6 cursor-pointer"
                      onClick={() =>
                        push({
                          pathname: `/projects/${project?.code}`,
                          query: {
                            book: el,
                            download: 'book',
                          },
                          shallow: true,
                        })
                      }
                    />
                  )}
                  <Reader className="w-6" />
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
    </>
  )
}

export default Testament
