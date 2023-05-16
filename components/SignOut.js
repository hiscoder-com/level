import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { supabase } from 'utils/supabaseClient'

export default function SignOut() {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation(['users'])
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
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
      className=" bg-teal-100 w-full py-2 rounded-lg text-red-500 text-lg font-bold"
    >
      {t('SignOut')}
    </button>
  )
}
