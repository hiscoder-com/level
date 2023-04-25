import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function BookCreate({ bookCode, project, user, mutateBooks, setBookCodeCreating }) {
  const { push } = useRouter()

  const { t } = useTranslation()
  const [isCreated, setIsCreated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [textModal, setTextModal] = useState(t('DoYouWantCreateBook'))

  const handleCreate = async (book_code) => {
    const book = project?.base_manifest?.books.find((el) => el.name === book_code)
    if (!book && !project.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    try {
      setIsCreating(true)
      setTextModal(t('BookIsCreating'))

      await axios
        .post('/api/create_chapters', {
          project_id: project.id,
          link: book.link,
          book_code,
        })
        .then((res) => {
          if (res.status == 201) {
            setIsCreated(true)
            mutateBooks()
            setTextModal(t('BookCreated'))
            setTimeout(() => {
              push(
                {
                  pathname: `/projects/${project?.code}`,
                  query: { book: book_code },
                },
                undefined,
                { shallow: true }
              )
            }, 2000)
          }
        })
    } catch (error) {
      setIsCreated(true)
      setTextModal(t('BookCreationError'))
      setTimeout(() => {
        reset()
      }, 2000)
      console.log(error)
    } finally {
      setIsCreating(false)
      mutateBooks()
    }
  }
  const reset = () => {
    setBookCodeCreating(null)
    setTimeout(() => {
      setTextModal(t('DoYouWantCreateBook'))
      setIsCreated(false)
      setIsCreating(false)
    }, 500)
  }
  return (
    <div>
      <Modal
        isOpen={typeof bookCode === 'string'}
        closeHandle={() => {
          reset()
        }}
        className={isCreated ? 'secondary' : 'primary'}
      >
        <div className="flex flex-col justify-center items-center min-h-[15vh]">
          <div className="flex flex-row gap-2 mb-4 text-2xl">
            <p>{textModal}</p>
            {isCreating && !isCreated && <p className="animate-pulse">...</p>}
          </div>
          {!isCreating && !isCreated && (
            <div className="flex flex-row gap-2 h4">
              <button
                className={`btn-link-full mx-2`}
                onClick={() => {
                  handleCreate(bookCode)
                }}
              >
                {t('Yes')}
              </button>

              <button
                className="btn-link-full mx-2"
                onClick={() => {
                  reset()
                }}
              >
                {isCreated ? t('Ok') : t('No')}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default BookCreate
