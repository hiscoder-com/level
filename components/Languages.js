import { useState, useEffect } from 'react'

import { supabase } from '../utils/supabaseClient'
import { useLanguages } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Languages({ isAdmin }) {
  const { t } = useTranslation('common')
  const { session } = useUser()
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
            {isAdmin ? (
              <span className="mx-5 my-2 btn btn-cyan btn-filled">Edit</span>
            ) : (
              ''
            )}
          </div>
        )
      })}
      {isAdmin && (
        <>
          <div>
            <button disabled={loading} className="mt-5 btn btn-cyan btn-filled">
              Добавить
            </button>
          </div>
        </>
      )}
    </div>
  )
}
