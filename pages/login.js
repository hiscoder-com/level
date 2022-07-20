import { useState, useEffect, useRef } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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
  const [isLoginError, setIsLoginError] = useState(false)
  const [isPasswordError, setIsPasswordError] = useState(false)
  const [hideWriteAdminButton, setHideWriteAdminButton] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const loginRef = useRef(null)
  const passwordRef = useRef(null)

  useEffect(() => {
    passwordRef.current.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword])

  useEffect(() => {
    loginRef.current.focus()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, error } = await supabase.auth.signIn({
        email: login,
        password,
      })
      if (error) throw error
      // TODO может попробовать использовать useCurrentUser.
      // По идее обновится состояние и он вернет текущего юзера,
      // у которого можно будет проверить поля и редиректить куда надо
      const { data: dataUser, error: errorUser } = await supabase
        .from('users')
        .select('agreement,confession')
        .eq('id', user?.id)
      if (errorUser) throw errorUser
      const { agreement, confession } = dataUser[0]
      // TODO END
      setIsLoginError(false)
      setIsPasswordError(false)
      setError(false)
      router.push(agreement && confession ? `/account/${user?.id}` : '/agreements')
    } catch (error) {
      setIsLoginError(true)
      setIsPasswordError(true)
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
            ref={loginRef}
            className={`input ${isLoginError && 'input-invalid'}`}
            type="text"
            placeholder={`${t('Login')}:`}
            onChange={(event) => {
              setLogin(event.target.value)
              setIsLoginError(false)
            }}
          />
          <div className="relative">
            <input
              ref={passwordRef}
              className={`input ${isPasswordError && 'input-invalid'}`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder={`${t('Password')}:`}
              onChange={(event) => {
                setPassword(event.target.value)
                setIsPasswordError(false)
              }}
            />
            <span
              className="eye"
              onClick={() => {
                setShowPassword((prev) => !prev)
              }}
            >
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
            <div
              disabled={hideWriteAdminButton}
              onClick={report}
              className="btn-white w-2/3"
            >
              {t('WriteAdmin')}
            </div>
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
