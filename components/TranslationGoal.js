import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import Modal from 'components/Modal'
import { useBriefs, useProject } from 'utils/hooks'
import axios from 'axios'

function TGoal({user}) {
  const [showModalTGoal, setShowModalTGoal] = useState(false)
  const { t } = useTranslation(['common'])
  const router = useRouter()
  const {
    query: { project: code },
  } = router
  const [project] = useProject({ token: user?.access_token, code })
  const [briefs, { loading, error, mutate }] = useBriefs({
    token: user?.access_token,
    project_id: project?.id,
  })

  const closeModal = () => {
    setShowModalTGoal(false)
  }

useEffect(() => {
  console.log(briefs)
}, [briefs])


  return (
    <>
      <button
        className="btn-cyan w-36"
        onClick={(e) => (setShowModalTGoal(!showModalTGoal), e.stopPropagation())}
      >
        {t('AboutTranslation')}
      </button>
      <Modal
        isOpen={showModalTGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal') + ':'}
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 whitespace-pre-line">{briefs?.text}</p>
        </div>
        <div className="mt-4">
          <button className="btn-cyan w-24" onClick={closeModal}>
            {t('Close')}
          </button>

        </div>
      </Modal>
    </>
  )
}

export default TGoal
