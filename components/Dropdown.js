import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import Book from './Book'
import Modal from './Modal'
import { projectIdState } from './state/atoms'

import { useGetBrief, useProject } from 'utils/hooks'

import Tools from 'public/icons/tools.svg'

function Dropdown({ description, isWholeBook = false }) {
  const [showModalTranslationGoal, setShowModalTranslationGoal] = useState(false)
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const [showModalFullBook, setShowModalFullBook] = useState(false)
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
    setShowModalFullBook(false)
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
        className="relative hidden cursor-pointer whitespace-nowrap rounded-md px-3 py-4 md:flex"
        onClick={toggle}
        ref={toolsButton}
      >
        <Tools className="fill-th-text-secondary-100" />
      </div>

      {isOpen && (
        <>
          <div
            ref={dropdownMenu}
            className="border-th-primary-100-border absolute right-5 z-40 flex flex-col justify-center divide-y divide-solid rounded-md border bg-th-secondary-10 shadow-md xl:right-0"
          >
            <button
              className="rounded-t-lg px-4 py-2 hover:bg-th-secondary-100 active:bg-th-secondary-100"
              onClick={(e) => {
                toggle()
                setShowModalStepGoal(true)
                e.stopPropagation()
              }}
            >
              {t('AboutStep').toUpperCase()}
            </button>
            {isWholeBook && (
              <button
                className="rounded-t-lg px-4 py-2 hover:bg-th-secondary-100 active:bg-th-secondary-100"
                onClick={(e) => {
                  toggle()
                  setShowModalFullBook(true)
                  e.stopPropagation()
                }}
              >
                {t('WholeBook').toUpperCase()}
              </button>
            )}
            {brief?.is_enable && (
              <button
                className="rounded-b-lg px-4 py-2 hover:bg-th-secondary-100 active:bg-th-secondary-100"
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
      <FullBook showModalFullBook={showModalFullBook} closeModal={closeModal} />
      {brief?.is_enable && (
        <TranslationGoal
          showModalTranslationGoal={showModalTranslationGoal}
          closeModal={closeModal}
          brief={brief}
        />
      )}
      <div className="flex items-center divide-x divide-solid whitespace-nowrap rounded-md bg-th-secondary-10 py-1 text-xs font-bold md:hidden">
        <button
          className="rounded-l-lg px-2 hover:opacity-70"
          onClick={(e) => {
            setShowModalStepGoal(true)
            e.stopPropagation()
          }}
        >
          {t('AboutStep').toUpperCase()}
        </button>
        {brief?.is_enable && (
          <button
            className="rounded-r-lg px-2 hover:opacity-70"
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
      <div className="my-6 max-h-[50vh] overflow-y-auto py-3 pr-4">
        <p className="whitespace-pre-line text-sm text-th-secondary-10">
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
        <div
          className="my-6 max-h-[50vh] overflow-y-auto py-3 pr-4 text-sm text-th-secondary-10"
          dir={brief?.is_rtl ? 'rtl' : 'ltr'}
        >
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

function FullBook({ showModalFullBook, closeModal }) {
  const { t } = useTranslation(['common'])
  const {
    query: { project, book },
  } = useRouter()
  const [currentProject] = useProject({ code: project })
  const mainResource = useMemo(() => {
    if (currentProject) {
      return currentProject?.resources[currentProject?.base_manifest?.resource]
    }
  }, [currentProject])
  const bookPath = useMemo(() => {
    if (mainResource) {
      return mainResource.manifest.projects.find((project) => project.identifier === book)
        .path
    }
  }, [book, mainResource])
  return (
    <Modal isOpen={showModalFullBook} closeHandle={closeModal} title={t('WholeBook')}>
      <div className="my-6 max-h-[50vh] min-h-[50vh] overflow-y-auto py-3 pr-4">
        <Book url="/api/git/whole-book" config={{ mainResource, book, bookPath }} />
      </div>
      <div className="text-center">
        <button className="btn-secondary" onClick={closeModal}>
          {t('Close')}
        </button>
      </div>
    </Modal>
  )
}
