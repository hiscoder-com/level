import { useCurrentUser } from '../lib/UserContext'
import { useTranslators } from '@/utils/hooks'

import TImage from './TImage'

function Translators({ projectCode }) {
  const { user } = useCurrentUser()

  const [translators] = useTranslators({
    token: user?.access_token,
    code: projectCode,
  })

  return (
    <div className="flex gap-1.5">
      {translators && Object.keys(translators).length > 0 && (
        <>
          {translators.map((item, key) => {
            return (
              <div key={key}>
                <TImage item={item} />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default Translators
