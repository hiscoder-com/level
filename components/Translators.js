import TranslatorImage from 'components/TranslatorImage'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'

function Translators({ projectCode, size, clickable = false }) {
  const { user } = useCurrentUser()
  const [translators] = useTranslators({
    token: user?.access_token,
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
