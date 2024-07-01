import TranslatorImage from 'components/TranslatorImage'
import { useMemo, useState } from 'react'

import Modal from './Modal'

import { useTranslators } from 'utils/hooks'

function Translators({
  projectCode,
  size,
  clickable = false,
  className,
  showModerator,
  isStep = false,
  activeTranslators = [],
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectTranslators] = useTranslators({
    code: projectCode,
  })
  const translators = useMemo(() => {
    if (!projectTranslators || (!isStep && activeTranslators?.length === 0)) {
      return projectTranslators || []
    }
    return projectTranslators.filter((item) =>
      activeTranslators?.some((translator) => translator.user_id === item.users.id)
    )
  }, [activeTranslators, isStep, projectTranslators])

  const visibleTranslators = translators.slice(0, 4)
  const hiddenCount = Math.max(translators.length - 4, 0)

  return (
    <>
      <div
        className={`flex items-center z-10 ${
          isStep ? 'max-w-xs p-2 overflow-x-auto' : 'max-w-full flex-wrap'
        }`}
      >
        {visibleTranslators.map((item, key) => (
          <div key={key} className={className}>
            <TranslatorImage
              clickable={clickable}
              item={item}
              size={size}
              showModerator={showModerator}
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
        title="All Translators"
        className={{
          dialogTitle: 'text-2xl font-medium leading-6',
          dialogPanel:
            'w-full max-w-md px-7 py-10 align-middle transform overflow-y-auto shadow-xl transition-all bg-th-primary-100 text-th-text-secondary-100 rounded-3xl',
        }}
      >
        <div className="flex flex-wrap gap-1.5 my-6 py-3 max-h-[50vh] overflow-y-auto">
          {translators.map((participant, index) => (
            <div key={index} className="flex items-center pb-1">
              <div className="flex flex-1 items-center gap-2.5 pl-1 pr-3 py-1 border rounded-3xl w-5/6 text-th-text-secondary-100">
                <div className="w-8 h-8 min-w-[2rem]">
                  <TranslatorImage
                    item={participant}
                    clickable={clickable}
                    showModerator={showModerator}
                  />
                </div>
                <div>
                  <p className="text-lg">{participant.users.login}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Translators
