import Link from 'next/link'

import { useLanguages } from '@/utils/hooks'
import { useCurrentUser } from '../lib/UserContext'
import { useTranslation } from 'next-i18next'

export default function Languages() {
  const { user } = useCurrentUser()

  const { t } = useTranslation('users')

  const [languages] = useLanguages(user?.access_token)
  return (
    <div className="flex justify-center flex-col  text-xl my-5 ">
      <h1 className="my-5">{t('Languages')}:</h1>
      {languages?.map((el, index) => {
        return (
          <div key={index}>
            <Link href={`/languages/${el.code}`}>
              <a className=" text-blue-600">{el.code + ' ' + el.orig_name}</a>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
