import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import useSupabaseClient from 'utils/supabaseClient'

import LogOut from 'public/icons/logout.svg'

export default function SignOut({ collapsed }) {
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
    <button
      disabled={loading}
      onClick={handleLogout}
      className={`flex w-full cursor-pointer items-center gap-2 px-4 py-3 ${
        loading ? 'opacity-70' : ''
      }`}
    >
      <LogOut
        className={`w-5 stroke-th-text-primary group-hover:stroke-th-text-primary group-hover:opacity-70 lg:stroke-th-secondary-300 ${
          collapsed ? 'opacity-70' : ''
        }`}
      />

      <p
        className={`opacity-70 lg:text-th-secondary-300 ${
          collapsed ? 'lg:hidden' : ''
        } group-hover:text-th-text-primary group-hover:opacity-70`}
      >
        {t('users:SignOut')}
      </p>
    </button>
  )
}
