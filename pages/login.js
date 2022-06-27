import { useState, useEffect, useRef } from 'react'

import { useTranslation } from 'next-i18next'

import { useRouter } from 'next/router'

import { supabase } from '../utils/supabaseClient'
import { useUser } from '../lib/UserContext'

import Report from '../public/report.svg'
import EyeIcon from '../public/eye-icon.svg'
import EyeOffIcon from '../public/eye-off-icon.svg'

export default function Login() {
  const { t } = useTranslation('common')

  const router = useRouter()
  const { user } = useUser()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const [styleLogin, setStyleLogin] = useState('input')
  const [stylePassword, setStylePassword] = useState('input')
  const [hideWriteAdminButton, setHideWriteAdminButton] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (password) {
      inputRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword])

  useEffect(() => {
    if (user) {
      router.push('/agreements')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signIn({
        email: login,
        password,
      })
      if (error) throw error
      setStyleLogin('input')
      setStylePassword('input')
      setError(false)
      router.push('/agreements')
    } catch (error) {
      setStyleLogin('input-invalid')
      setStylePassword('input-invalid')
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
              setStyleLogin('input')
            }}
          />
          <div className="relative">
            <input
              className={stylePassword}
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder={`${t('Password')}:`}
              onChange={(event) => {
                setPassword(event.target.value)
                setStylePassword('input')
              }}
              ref={inputRef}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
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
              className="btn-white w-2/3"
            >
              {t('WriteAdmin')}
            </button>
            <input
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="btn-cyan w-1/3"
              value={t('Next')}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
Login.backgroundColor = 'bg-white'
