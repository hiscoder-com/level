import TranslatorImage from 'components/TranslatorImage'

import { useTranslators } from 'utils/hooks'

function Translators({ projectCode, size, clickable = false, className, showModerator }) {
  const [translators] = useTranslators({
    code: projectCode,
  })

  return (
    <div className="flex items-center z-10">
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
