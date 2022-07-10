import { useState, useEffect } from 'react'

import { supabase } from '../utils/supabaseClient'
import { useLanguages } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LanguagesEdit({
  setShowLanguages,
  setShowProjects,
  setLanguageCode,
  isAdmin,
}) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { user, session } = useUser()
  const [loading, setLoading] = useState(false)
  const [eng, setEng] = useState('')
  const [code, setCode] = useState('')
  const [origName, setOrigName] = useState('')
  const [editLanguages, setEditLanguages] = useState(false)
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const canEditLanguages = async () => {
    const { data, error } = await supabase.rpc('authorize', {
      requested_permission: 'languages',
      user_id: user.id,
    })
    setEditLanguages(data)
    return data
  }
  useEffect(() => {
    if (user) {
      canEditLanguages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // const handleSave = async () => {
  //   try {
  //     setLoading(true)
  //     const { user, error } = await supabase
  //       .from('languages')
  //       .insert([{ eng, code, orig_name: origName }])
  //     if (error) throw error
  //     mutate()
  //   } catch (error) {
  //     alert(error.error_description || error.message)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  // const handleDelete = async (id) => {
  //   const { error } = await supabase.from('languages').delete().match({ id })
  //   if (error) throw error
  //   mutate()
  // }

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
