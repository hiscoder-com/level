import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

function BookCreate({ highLevelAccess, project, books, user }) {
  const [creatingBook, setCreatingBook] = useState(false)
  const [selectedBook, setSelectedBook] = useState('')

  const { push } = useRouter()
  const { t } = useTranslation(['common'])

  useEffect(() => {
    const defaultVal = project?.base_manifest?.books?.filter(
      (el) => !books?.map((el) => el.code)?.includes(el.name)
    )?.[0]?.name
    if (defaultVal) {
      setSelectedBook(defaultVal)
    }
  }, [books, project?.base_manifest?.books])

  const handleCreate = async () => {
    setCreatingBook(true)
    const book = project?.base_manifest?.books.find((el) => el.name === selectedBook)
    if (!book && !project.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    try {
      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code: selectedBook,
        })
        .then((res) => {
          if (res.status == 201) {
            push(
              {
                pathname: `/projects/${project?.code}`,
                query: { book: selectedBook },
              },
              undefined,
              { shallow: true }
            )
          }
        })
    } catch (error) {
      console.log(error)
    } finally {
      setCreatingBook(false)
    }
  }

  return (
    <>
      {highLevelAccess && (
        <>
          <h3 className="mt-4 ">{t('CreateBook')}</h3>
          <div className="mt-4 pb-4">
            <select
              className="input max-w-xs"
              onChange={(e) => setSelectedBook(e.target.value)}
              value={selectedBook}
            >
              {project?.base_manifest?.books
                ?.filter(
                  (el) =>
                    !books?.map((book) => book.code)?.includes(el.name) &&
                    el.name !== 'frt'
                )
                .map((el) => (
                  <option value={el.name} key={el.name}>
                    {t(`books:${el.name}`)}
                  </option>
                ))}
            </select>
            <button
              className="btn btn-cyan ml-2"
              onClick={handleCreate}
              disabled={creatingBook}
            >
              {t('Create')}
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default BookCreate
