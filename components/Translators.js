import { useCurrentUser } from '../lib/UserContext'
import { useTranslators } from '@/utils/hooks'

import TranslatorImage from './TranslatorImage'
const test = [
  { url: 'https://avatars.githubusercontent.com/u/60795829?v=4', status: true },
  { url: 'https://avatars.githubusercontent.com/u/74174349?v=4', status: false },
  { url: 'https://avatars.githubusercontent.com/u/30548361?v=4', status: true },
  { url: 'https://avatars.githubusercontent.com/u/68908261?v=4', status: false },
]
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
                <TranslatorImage item={item} size="34px" />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default Translators
