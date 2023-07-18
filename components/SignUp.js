import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

export default function SignUp() {
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const { t } = useTranslation(['users'])
  const { user } = useCurrentUser()

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { user, session, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      alert('Check your email to confirm registration.')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { user, session, error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center flex-col text-center text-3xl my-5">
      <h1 className="my-5">{t('SignUp')}</h1>

      <div>
        <label>{t('Email')}</label>
        <input
          className="border border-green-600 p-2"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>{t('Password')}</label>
        <input
          className="border border-green-600 p-2"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button
          disabled={loading}
          onClick={handleLogin}
          className="text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2 disabled:text-gray-400"
        >
          {t('Register')}
        </button>
        <div>
          <button
            disabled={loading}
            onClick={handleLogout}
            className="text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2 disabled:text-gray-400"
          >
            {t('SignOut')}
          </button>
        </div>
        {t('YourLogin')} : {user ? user.email : `${t('NoAuthenticate')}`}
      </div>
    </div>
  )
}
