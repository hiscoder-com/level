import { useMemo } from 'react'

import TranslatorImage from 'components/TranslatorImage'

import { useTranslators } from 'utils/hooks'

function Translators({
  projectCode,
  size,
  showModerator,
  activeTranslators = [],
  support = false,
  clickable = false,
}) {
  const [_translators] = useTranslators({
    code: projectCode,
  })
  const translators = useMemo(() => {
    if (!_translators) return []
    if (!activeTranslators.length) {
      return _translators
    }
    return _translators
      .map((translator) => {
        const _translator = activeTranslators.find(
          (activeTranslator) => activeTranslator.login === translator.users.login
        )
        return _translator ? { ...translator, step: _translator.step } : translator
      })
      .filter((translator) =>
        activeTranslators.some(
          (activeTranslator) => activeTranslator.login === translator.users.login
        )
      )
  }, [_translators, activeTranslators])

  return (
    <div className="flex items-center">
      {translators && translators.length > 0 && (
        <>
          {translators.map((translator, key) => {
            return (
              <div key={key} className="-mx-0.5">
                <TranslatorImage
                  clickable={clickable}
                  item={translator}
                  size={size}
                  support={support}
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
