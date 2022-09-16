import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'

import TranslatorImage from './TranslatorImage'

function Translators({ projectCode, size }) {
  const { user } = useCurrentUser()
  const [translators] = useTranslators({
    token: user?.access_token,
    code: projectCode,
  })

  return (
    <div className="flex gap-1.5">
      {translators && translators.length > 0 && (
        <>
          {translators.map((item, key) => {
            return (
              <div key={key}>
                <TranslatorImage item={item} size={size} />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default Translators
