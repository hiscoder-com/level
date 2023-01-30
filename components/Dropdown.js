import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useRecoilValue } from 'recoil'

import Modal from './Modal'

import { useBrief } from 'utils/hooks'
import { projectIdState } from './Panel/state/atoms'

import Tools from 'public/tools.svg'

function Dropdown({ description, user }) {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownMenu = useRef(null)
  const toolsButton = useRef(null)

  const toggle = () => setIsOpen((prev) => !prev)
  const { t } = useTranslation(['common'])

  const closeModal = () => {
    setShowModalStepGoal(false)
    setShowModalTranslationGoal(false)
  }

  useEffect(() => {
    const onClick = (e) => {
      if (
        isOpen &&
        !toolsButton?.current?.contains(e.target) &&
        !dropdownMenu?.current?.contains(e.target)
      ) {
        // если дропдаун открыт, клик не по иконке Tools и не внутри меню, то закрываем дропдаун
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('click', onClick)
    }
    return () => document.removeEventListener('click', onClick)
  }, [isOpen])

  return (
    <div>
      <div
        className="relative hidden px-3 py-4 rounded-md whitespace-nowrap cursor-pointer md:flex"
        onClick={toggle}
        ref={toolsButton}
      >
        <Tools />
      </div>

      {isOpen && (
        <>
          <div
            ref={dropdownMenu}
            className="absolute flex flex-col right-5 border-2 border-cyan-600 divide-y divide-solid bg-white rounded-md shadow-md z-40 xl:right-0"
          >
            <button
              className="px-4 py-2 rounded-t-lg	hover:bg-cyan-50
			active:bg-cyan-200"
              onClick={(e) => {
                toggle()
                setShowModalStepGoal(true)
                e.stopPropagation()
              }}
            >
              {t('AboutStep').toUpperCase()}
            </button>

            <button
              className="px-4 py-2 rounded-b-lg hover:bg-cyan-50
			active:bg-cyan-200"
              onClick={(e) => {
                toggle()
                setShowModalTranslationGoal(true)
                e.stopPropagation()
              }}
            >
              {t('AboutTranslation').toUpperCase()}
            </button>
          </div>
        </>
      )}
      <StepGoal
        showModalStepGoal={showModalStepGoal}
        closeModal={closeModal}
        description={description}
      />
      <TranslationGoal
        showModalTranslationGoal={showModalTranslationGoal}
        user={user}
        closeModal={closeModal}
      />

      <div className="py-1 whitespace-nowrap text-xs font-bold border-2 border-cyan-600 rounded-md divide-x divide-solid md:hidden">
        <button
          className="px-2 rounded-l-lg active:bg-cyan-50"
          onClick={(e) => {
            setShowModalStepGoal(true)
            e.stopPropagation()
          }}
        >
          {t('AboutStep').toUpperCase()}
        </button>

        <button
          className="px-2 rounded-r-lg active:bg-cyan-50"
          onClick={(e) => {
            setShowModalTranslationGoal(true)
            e.stopPropagation()
          }}
        >
          {t('AboutTranslation').toUpperCase()}
        </button>
      </div>
    </div>
  )
}

export default Dropdown

function StepGoal({ showModalStepGoal, closeModal, description }) {
  const { t } = useTranslation(['common'])

  return (
    <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
      <div className="my-6 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
        <p className="text-sm text-gray-500 whitespace-pre-line">
          {description.replaceAll('\n\n', '\n')}
        </p>
      </div>
      <div className="text-center">
        <button className="btn-cyan" onClick={closeModal}>
          {t('Close')}
        </button>
      </div>
    </Modal>
  )
}

function TranslationGoal({ showModalTranslationGoal, closeModal, user }) {
  const { t } = useTranslation(['common'])

  const projectId = useRecoilValue(projectIdState)

  const [brief] = useBrief({
    token: user?.access_token,
    project_id: projectId,
  })

  const briefResume = brief?.data_collection
    .map((obj) => obj.resume)
    .filter((obj) => obj !== '')

  return (
    <>
      <Modal
        isOpen={showModalTranslationGoal}
        closeHandle={closeModal}
        title={t('TranslationGoal')}
      >
        <div className="my-6 py-3 overflow-auto" style={{ maxHeight: '50vh' }}>
          {briefResume?.map((resumeItem, index) => (
            <li key={index} className="text-sm text-gray-500">
              {resumeItem}
            </li>
          ))}
        </div>
        <div className="text-center">
          <button className="btn-cyan" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}
