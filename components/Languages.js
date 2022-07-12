import { useState, useEffect } from 'react'

import { useAuthenticated, useLanguages } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { useTranslation } from 'next-i18next'

import Link from 'next/link'

export default function Languages() {
  const { user, session } = useUser()
  const [authenticated] = useAuthenticated({
    token: session?.access_token,
    id: user?.id,
  })
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(false)

  const [languages] = useLanguages(session?.access_token)
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
