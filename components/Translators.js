import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'

import Modal from './Modal'

import { useTranslators } from 'utils/hooks'

function Translators({
  projectCode,
  size,
  className,
  showModerator,
  isStep = false,
  clickable = false,
  activeTranslators = [],
}) {
  const { t } = useTranslation('common')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectTranslators] = useTranslators({
    code: projectCode,
  })

  const {
    push,
    query: { project, book, chapter, step, translator },
  } = useRouter()

  const translators = useMemo(() => {
    if (!projectTranslators || (!isStep && activeTranslators?.length === 0)) {
      return projectTranslators || []
    }
    return projectTranslators.filter((projectTranslator) =>
      activeTranslators?.some(
        (translator) => translator.user_id === projectTranslator.users.id
      )
    )
  }, [activeTranslators, isStep, projectTranslators])

  const visibleTranslators = translators.slice(0, 4)
  const hiddenCount = Math.max(translators.length - 4, 0)

  const handleTranslatorClick = useCallback(
    (item) => {
      if (clickable && (!translator || translator !== item.users?.login)) {
        push(`/translate/${project}/${book}/${chapter}/${step}/${item.users?.login}`)
      }
    },
    [clickable, translator, push, project, book, chapter, step]
  )

  return (
    <>
      <div
        className={`z-10 flex items-center ${
          isStep ? 'max-w-xs overflow-x-auto p-2' : 'max-w-full flex-wrap'
        }`}
      >
        {visibleTranslators.map((translator, key) => (
          <div key={key} className={className} onClick={() => setIsModalOpen(true)}>
            <TranslatorImage
              item={translator}
              size={size}
              showModerator={showModerator}
              isPointerCursor
            />
          </div>
        ))}
        {hiddenCount > 0 && (
          <div
            className={`${className} z-10 flex cursor-pointer items-center justify-center rounded-full bg-th-primary-500 text-xs text-th-text-secondary-100`}
            style={{ width: size, height: size }}
            onClick={() => setIsModalOpen(true)}
          >
            +{hiddenCount}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        closeHandle={() => setIsModalOpen(false)}
        title={t('AllTranslators')}
        className={{
          dialogTitle: 'text-2xl font-medium leading-6',
          dialogPanel:
            'w-full max-w-md transform overflow-y-auto rounded-3xl bg-th-primary-100 px-7 py-10 align-middle text-th-text-secondary-100 shadow-xl transition-all',
        }}
      >
        <div className="my-6 flex max-h-[50vh] flex-wrap gap-x-1.5 gap-y-2.5 overflow-y-auto py-3">
          {translators.map((participant, index) => (
            <div
              key={index}
              className={`flex items-center gap-2.5 rounded-3xl border py-1 pl-1 pr-3 text-lg ${
                clickable
                  ? 'cursor-pointer transition-opacity duration-300 hover:opacity-70'
                  : ''
              }`}
              onClick={() => handleTranslatorClick(participant)}
            >
              <div className="h-8 w-8">
                <TranslatorImage item={participant} showModerator={showModerator} />
              </div>
              <p>{participant.users.login}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
            {t('Close')}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Translators
