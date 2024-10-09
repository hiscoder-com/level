import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import ButtonLoading from './ButtonLoading'

import useSupabaseClient from 'utils/supabaseClient'

import LogOut from 'public/logout.svg'

export default function SignOut() {
  const supabaseClient = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation('users')
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
      router.push('/')
    }
  }

  return (
    // <ButtonLoading
    //   isLoading={loading}
    //   onClick={handleLogout}
    //   className="btn-primary w-full"
    // >
    //   {t('users:SignOut')}
    // </ButtonLoading>
    <div onClick={handleLogout} className="flex w-full items-center gap-2 cursor-pointer">
      <div className="p-2 stroke-th-text-primary">
        <LogOut className="w-5 h-5 stroke-th-text-primary" />
      </div>
      <p>{t('users:SignOut')}</p>
    </div>
  )
}
