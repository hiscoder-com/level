import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'
import useSupabaseClient from 'utils/supabaseClient'

function ChapterCreate({
  setCreatingChapter,
  creatingChapter,
  mutate: { mutateChapters, mutateCreatedChapters },
  project,
}) {
  const supabase = useSupabaseClient()

  const {
    push,
    query: { bookid },
  } = useRouter()
  const { t } = useTranslation()
  const [isCreated, setIsCreated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [textModal, setTextModal] = useState(t('DoYouWantCreateChapter'))

  const reset = () => {
    setCreatingChapter(false)
    setTimeout(() => {
      setIsCreated(false)
      setIsCreating(false)
      setTextModal(t('DoYouWantCreateChapter'))
    }, 500)
  }
  const handleAddChapter = async ({ chapter_id, num }) => {
    const unsuccessful = () => {
      setIsCreated(true)
      setTextModal(t('ChapterCreatingError'))
      setTimeout(reset, 2000)
    }
    if (chapter_id && num) {
      try {
        setIsCreating(true)
        setTextModal(t('ChapterIsCreating'))

        const res = await supabase.rpc('create_verses', { chapter_id })
        if (res.data) {
          setTimeout(() => {
            setIsCreated(true)
            mutateChapters()
            mutateCreatedChapters()
            setTextModal(t('ChapterCreated'))
            setTimeout(() => {
              push('/projects/' + project.code + '/books/' + bookid + '/' + num)
            }, 2000)
          }, 1000)
        } else {
          unsuccessful()
          console.log(res)
        }
      } catch (error) {
        unsuccessful()
        console.log(error)
      }
    }
  }
  return (
    <Modal
      isOpen={typeof creatingChapter === 'object'}
      closeHandle={reset}
      className={{
        dialogPanel: `w-full max-w-md align-middle p-6 rounded-3xl ${
          isCreated
            ? 'bg-th-secondary-300 text-th-secondary-10'
            : 'bg-th-primary-100 text-th-text-secondary-100'
        }`,
      }}
      handleCloseDisabled={isCreating}
    >
      <div className="flex flex-col justify-center items-center gap-7 min-h-[15vh]">
        <div className="flex flex-row gap-2 mb-4 text-xl text-center">
          <p>{textModal}</p>
          {isCreating && !isCreated && <p className="animate-pulse">...</p>}
        </div>
        {!isCreating && !isCreated && (
          <div className="flex justify-center gap-4 w-1/2 text-xl">
            <button
              className="btn-secondary flex-1"
              onClick={() =>
                handleAddChapter({
                  chapter_id: creatingChapter.id,
                  num: creatingChapter.num,
                })
              }
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
  )
}

export default ChapterCreate
