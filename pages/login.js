import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { supabase } from '@/utils/supabaseClient'

import Report from '../public/report.svg'
import EyeIcon from '../public/eye-icon.svg'
import EyeOffIcon from '../public/eye-off-icon.svg'

export default function Login() {
  const { t } = useTranslation('common')

  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const [styleLogin, setStyleLogin] = useState('form')
  const [stylePassword, setStylePassword] = useState('form')
  const [hideWriteAdminButton, setHideWriteAdminButton] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, error } = await supabase.auth.signIn({
        email: login,
        password,
      })
      if (error) throw error
      const { data: dataUser, error: errorUser } = await supabase
        .from('users')
        .select('agreement,confession')
        .eq('id', user?.id)
      if (errorUser) throw errorUser
      const { agreement, confession } = dataUser[0]

      setStyleLogin('form')
      setStylePassword('form')
      setError(false)
      router.push(agreement && confession ? `/account/${user?.id}` : '/agreements')
    } catch (error) {
      setStyleLogin('form-invalid')
      setStylePassword('form-invalid')
      setHideWriteAdminButton(false)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const report = (e) => {
    e.preventDefault()
    alert('Вы написали админу')
  }

  return (
    <div className="layout-appbar">
      <div className="w-5/6 md:max-w-xs">
        <h1 className="h1 mb-8">{t('SignIn')}:</h1>
        <form className="relative mb-2 space-y-2.5">
          <input
            className={styleLogin}
            type="text"
            placeholder={`${t('Login')}:`}
            onChange={(event) => {
              setLogin(event.target.value)
              setStyleLogin('form')
            }}
          />
          <div className=" styleLogin relative">
            <input
              className={stylePassword}
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder={`${t('Password')}:`}
              onChange={(event) => {
                setPassword(event.target.value)
                setStylePassword('form')
              }}
            />
            <span className="eye" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            {error && (
              <>
                <p className="flex text-xs text-red-600">
                  <Report /> {t('WrongLoginPassword')}
                </p>
                <a
                  href="#"
                  className="font-medium underline text-sky-500 hover:text-sky-600"
                >
                  {t('ForgotPassword')}?
                </a>
              </>
            )}
          </div>
          <div className="flex gap-2.5 h-9">
            <button
              disabled={hideWriteAdminButton}
              onClick={report}
              className="w-8/12 btn-transparent"
            >
              {t('WriteAdmin')}
            </button>
            <input
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="w-4/12 btn-filled"
              value={t('Next')}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
Login.backgroundColor = 'bg-white'
