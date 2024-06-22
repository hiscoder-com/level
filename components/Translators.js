import TranslatorImage from 'components/TranslatorImage'
import { useMemo } from 'react'

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

  return (
    <div
      className={`flex items-center z-10 overflow-x-auto ${
        isStep ? 'max-w-xs p-2' : 'max-w-full flex-wrap'
      }`}
    >
      {translators && translators.length > 0 && (
        <>
          {translators.map((item, key) => {
            return (
              <div key={key} className={className}>
                <TranslatorImage
                  clickable={clickable}
                  item={item}
                  size={size}
                  showModerator={showModerator}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default Translators
