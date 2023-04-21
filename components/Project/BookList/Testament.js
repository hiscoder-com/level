import PropertiesOfBook from './BookProperties/BookProperties'
import Gear from '/public/gear.svg'
import Reader from '/public/dictionary.svg'
import Pencil from '/public/editor-pencil.svg'
import Download from '/public/download.svg'
import Play from '/public/play.svg'

import axios from 'axios'

import ChecksIcon from './ChecksIcon'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useGetBooks } from 'utils/hooks'
import { useMemo, useState } from 'react'

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
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })
  const [openProperties, setOpenProperties] = useState(false)
  const [selectedBookProperties, setSelectedBookProperties] = useState(null)
  const handleCreate = async (book_code) => {
    const book = project?.base_manifest?.books.find((el) => el.name === book_code)
    if (!book && !project.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    try {
      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code,
        })
        .then((res) => {
          if (res.status == 201) {
            push(
              {
                pathname: `/projects/${project?.code}`,
                query: { book: book_code },
              },
              undefined,
              { shallow: true }
            )
          }
        })
    } catch (error) {
      console.log(error)
    } finally {
      mutateBooks()
    }
  }
  const createdBooks = useMemo(() => books?.map((el) => el.code), [books])

  const handleOpenBook = (book, isBookCreated) => {
    if (isBookCreated && book) {
      setCurrentBook(book)
      push({
        pathname: `/projects/${project?.code}`,
        query: { book: book },
        shallow: true,
      })
    }
  }

  return (
    <>
      <div className="flex flex-col gap-7 px-3">
        <h3 className="h3 font-bold">{t('common:' + title)}</h3>
        <div className="flex flex-col gap-4 overflow-y-scroll pr-4 max-h-[100vh]">
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
                            className="w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenProperties(true)
                              setSelectedBookProperties(el)
                            }}
                          />
                          {/* <Pencil className="w-6" /> */}
                        </>
                      )}
                    </>
                  )}
                  {!isBookCreated && isAdminAccess && (
                    <Play
                      className="w-6 cursor-pointer"
                      onClick={() => handleCreate(el)}
                    />
                  )}
                  {isModeratorAccess && isBookCreated && <Download className="w-6" />}
                  <Reader className="w-6" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <PropertiesOfBook
        project={project}
        user={user}
        bookCode={selectedBookProperties}
        openDownloading={openProperties}
        setOpenDownloading={setOpenProperties}
        type={project?.type}
        t={t}
        mutateBooks={mutateBooks}
        books={books}
      />
    </>
  )
}

export default Testament
