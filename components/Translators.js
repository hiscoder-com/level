import TranslatorImage from 'components/TranslatorImage'

import { useTranslators } from 'utils/hooks'

function Translators({ projectCode, size, clickable = false }) {
  const [translators] = useTranslators({
    code: projectCode,
  })

  return (
    <div className="flex">
      {translators && translators.length > 0 && (
        <>
          {translators.map((item, key) => {
            return (
              <div key={key} className="-mx-1">
                <TranslatorImage clickable={clickable} item={item} size={size} />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default Translators
