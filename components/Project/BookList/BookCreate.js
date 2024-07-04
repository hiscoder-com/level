import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function BookCreate({ bookCode, project, mutateBooks, setBookCodeCreating }) {
  const { push } = useRouter()

  const { t } = useTranslation('common')
  const [isCreated, setIsCreated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [textModal, setTextModal] = useState(t('DoYouWantCreateBook'))

  const handleCreate = async (book_code) => {
    const book = project?.base_manifest?.books.find((el) => el.name === book_code)
    if (!book && !project.id) {
      return
    }
    const unsuccessfulCreate = () => {
      setIsCreated(true)
      setTextModal(t('BookCreationError'))
      setTimeout(reset, 2000)
    }
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
          if (res.status === 201) {
            setIsCreated(true)
            mutateBooks()
            setTextModal(t('BookCreated'))
            setTimeout(() => {
              push({
                pathname: `/projects/${project?.code}/books/${book_code}`,
              })
            }, 2000)
          } else {
            unsuccessfulCreate()
            console.log(res)
          }
        })
    } catch (error) {
      unsuccessfulCreate() //TODO быстро закрывается
      console.log(error)
    } finally {
      setIsCreating(false)
      mutateBooks()
    }
  }
  const reset = () => {
    setBookCodeCreating(null)
    setTimeout(() => {
      setIsCreated(false)
      setIsCreating(false)
      setTextModal(t('DoYouWantCreateBook'))
    }, 500)
  }
  return (
    <div>
      <Modal
        isOpen={typeof bookCode === 'string'}
        closeHandle={reset}
        className={{
          dialogPanel: `w-full max-w-md align-middle p-6 rounded-3xl ${
            isCreated
              ? 'bg-th-secondary-300 text-th-text-secondary-100'
              : 'bg-th-primary-100 text-th-text-secondary-100'
          }`,
        }}
        handleCloseDisabled={isCreating}
      >
        <div className="flex flex-col justify-center items-center gap-7 min-h-[10rem]">
          <div className="flex flex-row gap-2 mb-4 text-xl sm:text-2xl text-center">
            <p>{textModal}</p>
            {isCreating && !isCreated && <p className="animate-pulse">...</p>}
          </div>
          {!isCreating && !isCreated && (
            <div className="flex justify-center gap-4 w-1/2">
              <button
                className="btn-secondary flex-1"
                onClick={() => handleCreate(bookCode)}
              >
                {t('Yes')}
              </button>
              <button className="btn-secondary flex-1" onClick={reset}>
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
