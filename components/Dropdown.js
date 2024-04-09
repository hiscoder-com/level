import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useRecoilValue } from 'recoil'

import Modal from './Modal'

import { useGetBrief } from 'utils/hooks'
import { projectIdState } from './state/atoms'

import Tools from 'public/tools.svg'

function Dropdown({ description }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const projectId = useRecoilValue(projectIdState)
  const [brief] = useGetBrief({
    project_id: projectId,
  })
  const dropdownMenu = useRef(null)
  const toolsButton = useRef(null)
  const { t } = useTranslation(['common'])
  const toggle = () => setIsOpen((prev) => !prev)
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
        className="relative hidden md:flex px-3 py-4 rounded-md whitespace-nowrap cursor-pointer"
        onClick={toggle}
        ref={toolsButton}
      >
        <Tools className="fill-th-text-secondary-100" />
      </div>

      {isOpen && (
        <>
          <div
            ref={dropdownMenu}
            className="absolute flex flex-col justify-center right-5 xl:right-0 border border-th-primary-100-border divide-y divide-solid bg-th-secondary-10 rounded-md shadow-md z-40"
          >
            <button
              className="px-4 py-2 rounded-t-lg	hover:bg-th-secondary-100 active:bg-th-secondary-100"
              onClick={(e) => {
                toggle()
                setShowModalStepGoal(true)
                e.stopPropagation()
              }}
            >
              {t('AboutStep').toUpperCase()}
            </button>
            {brief?.is_enable && (
              <button
                className="px-4 py-2 rounded-b-lg hover:bg-th-secondary-100
			active:bg-th-secondary-100"
                onClick={(e) => {
                  toggle()
                  setShowModalTranslationGoal(true)
                  e.stopPropagation()
                }}
              >
                {brief?.name === 'Brief' || !brief?.name
                  ? t('AboutTranslation').toUpperCase()
                  : brief.name.toUpperCase()}
              </button>
            )}
          </div>
        </>
      )}
      <StepGoal
        showModalStepGoal={showModalStepGoal}
        closeModal={closeModal}
        description={description}
      />
      {brief?.is_enable && (
        <TranslationGoal
          showModalTranslationGoal={showModalTranslationGoal}
          closeModal={closeModal}
          brief={brief}
        />
      )}
      <div className="flex items-center py-1 whitespace-nowrap text-xs font-bold rounded-md divide-x divide-solid md:hidden bg-th-secondary-10">
        <button
          className="px-2 rounded-l-lg hover:opacity-70"
          onClick={(e) => {
            setShowModalStepGoal(true)
            e.stopPropagation()
          }}
        >
          {t('AboutStep').toUpperCase()}
        </button>
        {brief?.is_enable && (
          <button
            className="px-2 rounded-r-lg hover:opacity-70"
            onClick={(e) => {
              setShowModalTranslationGoal(true)
              e.stopPropagation()
            }}
          >
            {t('AboutTranslation').toUpperCase()}
          </button>
        )}
      </div>
    </div>
  )
}

export default Dropdown

function StepGoal({ showModalStepGoal, closeModal, description }) {
  const { t } = useTranslation(['common'])

  return (
    <Modal isOpen={showModalStepGoal} closeHandle={closeModal} title={t('Goal')}>
      <div className="my-6 py-3 pr-4 max-h-[50vh] overflow-y-auto">
        <p className="text-sm text-th-secondary-10 whitespace-pre-line">
          {description.replaceAll('\n\n', '\n')}
        </p>
      </div>
      <div className="text-center">
        <button className="btn-secondary" onClick={closeModal}>
          {t('Close')}
        </button>
      </div>
    </Modal>
  )
}

function TranslationGoal({ showModalTranslationGoal, closeModal, brief }) {
  const { t } = useTranslation(['common'])

  const briefResume = brief?.data_collection
    ?.map((obj) => obj.resume)
    .filter((obj) => obj !== '')

  return (
    <>
      <Modal
        isOpen={showModalTranslationGoal}
        closeHandle={closeModal}
        title={
          brief?.name === 'Brief' || !brief?.name ? t('TranslationGoal') : brief?.name
        }
      >
        <div className="my-6 py-3 pr-4 max-h-[50vh] text-sm text-th-secondary-10 overflow-y-auto">
          {briefResume?.map((resumeItem, index) => (
            <li key={index}>{resumeItem}</li>
          ))}
        </div>
        <div className="text-center">
          <button className="btn-secondary" onClick={closeModal}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}
