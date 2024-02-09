import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import ButtonLoading from './ButtonLoading'

import useSupabaseClient from 'utils/supabaseClient'

export default function SignOut({ isStartPage = false }) {
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

  const buttonClassName = isStartPage
    ? 'relative px-5 py-4 mt-10 lg:mt-16 rounded-lg text-center w-full text-sm md:text-base font-medium text-th-text-secondary-100 bg-[#3C6E71]'
    : 'btn-primary w-full'

  return (
    <ButtonLoading isLoading={loading} onClick={handleLogout} className={buttonClassName}>
      {t('users:SignOut')}
    </ButtonLoading>
  )
}
