import { useMemo, useState, useCallback } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Modal from './Modal'
import TranslatorImage from 'components/TranslatorImage'

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
        className={`flex items-center z-10 ${
          isStep ? 'max-w-xs p-2 overflow-x-auto' : 'max-w-full flex-wrap'
        }`}
      >
        {visibleTranslators.map((translator, key) => (
          <div
            key={key}
            className={className}
            onClick={() => handleTranslatorClick(translator)}
          >
            <TranslatorImage
              item={translator}
              size={size}
              showModerator={showModerator}
              isPointerCursor={clickable}
            />
          </div>
        ))}
        {hiddenCount > 0 && (
          <div
            className={`${className} flex items-center justify-center bg-th-primary-500 text-th-text-secondary-100 rounded-full text-xs z-10 cursor-pointer`}
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
            'w-full max-w-md px-7 py-10 align-middle transform overflow-y-auto shadow-xl transition-all bg-th-primary-100 text-th-text-secondary-100 rounded-3xl',
        }}
      >
        <div className="flex flex-wrap gap-x-1.5 gap-y-2.5 my-6 py-3 max-h-[50vh] overflow-y-auto">
          {translators.map((participant, index) => (
            <div
              key={index}
              className={`flex items-center gap-2.5 pl-1 pr-3 py-1 border rounded-3xl text-lg ${
                clickable
                  ? 'cursor-pointer transition-opacity duration-300 hover:opacity-70'
                  : ''
              }`}
              onClick={() => handleTranslatorClick(participant)}
            >
              <div className="w-8 h-8">
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
