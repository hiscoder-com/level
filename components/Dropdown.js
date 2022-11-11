import React, { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Modal from './Modal'

import { useBriefs } from 'utils/hooks'

import Tools from 'public/tools.svg'

function Dropdown({ project, description, user }) {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const [showModalTGoal, setShowModalTGoal] = useState(false)
  const [open, setOpen] = useState(false)

  const opposite = () => setOpen(!open)
  const { t } = useTranslation(['common'])

  const [briefs] = useBriefs({
    token: user?.access_token,
    project_id: project?.id,
  })

  const closeModal = () => {
    setShowModalStepGoal(false)
    setShowModalTGoal(false)
  }

  return (
    <div>
      <div className="relative px-3 py-4 whitespace-nowrap rounded-md" onClick={opposite}>
        <a className="cursor-pointer">
          <Tools />
        </a>
      </div>

      {open && (
        <>
          <div className="fixed inset-0" onClick={opposite} />
          <div className="absolute right-0 flex flex-col shadow-md border-2 border-cyan-600 z-40 divide-y divide-solid bg-white rounded-md">
            <button
              className="w-36 py-2 rounded-t-lg	hover:bg-cyan-50
        active:bg-cyan-200"
              onClick={(e) => {
                opposite()
                setShowModalStepGoal((prev) => !prev), e.stopPropagation()
              }}
            >
              {t('AboutStep')}
            </button>

            <button
              className="w-36 py-2 rounded-b-lg hover:bg-cyan-50
        active:bg-cyan-200"
              onClick={(e) => {
                opposite()
                setShowModalTGoal((prev) => !prev), e.stopPropagation()
              }}
            >
              {t('AboutTranslation')}
            </button>
          </div>
        </>
      )}
      <StepGoal
        showModalStepGoal={showModalStepGoal}
        t={t}
        closeModal={closeModal}
        description={description}
      />
      <TGoal
        showModalTGoal={showModalTGoal}
        t={t}
        user={user}
        closeModal={closeModal}
        briefs={briefs}
      />
    </div>
  )
}

export default Dropdown

function StepGoal({ showModalStepGoal, t, closeModal, description }) {
  return (
    <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
      <div className="my-6 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
        <p className="text-sm text-gray-500 whitespace-pre-line">
          {description.replaceAll('\n\n', '\n')}
        </p>
      </div>
      <div className="text-center">
        <button className="btn-cyan w-24" onClick={closeModal}>
          {t('Close')}
        </button>
      </div>
    </Modal>
  )
}

function TGoal({ showModalTGoal, t, closeModal, briefs }) {
  return (
    <>
      <Modal
        isOpen={showModalTGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal')}
      >
        <div className="my-6 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
          <p className="text-sm text-gray-500 whitespace-pre-line">{briefs?.text}</p>
        </div>
        <div className="text-center">
          <button className="btn-cyan w-24" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}
