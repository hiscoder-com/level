import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'
import SignOut from './SignOut'

import { useRedirect } from 'utils/hooks'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'

import Report from 'public/error-outline.svg'
import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'

function Login() {
  const supabase = useSupabaseClient()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [login, setLogin] = useState('')

  const { user, loading } = useCurrentUser()
  const { t } = useTranslation('users')
  const passwordRef = useRef(null)
  const loginRef = useRef(null)
  const router = useRouter()

  const { href } = useRedirect({
    user,
    startLink: '/agreements',
  })

  useEffect(() => {
    if (passwordRef?.current) {
      passwordRef.current.focus()
    }
  }, [showPassword])

  useEffect(() => {
    if (loginRef?.current) {
      loginRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (user) {
      const { agreement, confession } = user
      setError(false)
      router.push(agreement && confession ? `/account` : '/agreements')
    }
  }, [router, user])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: login,
        password,
      })
      if (error) throw error
      setError(false)
    } catch (error) {
      setError(true)
    }
  }

  return (
    <>
      {user?.id ? (
        <div className="flex flex-col p-5 lg:py-10 xl:px-8">
          <div className="flex justify-end mb-6">
            <SwitchLocalization />
          </div>

          <div className="mb-6 lg:mb-14 text-center">
            <div>
              {t('YouSignInAs')} {user.login}
            </div>
            <div>
              {t('Email')} {user.email}
            </div>
            <Link href={href ?? '/'} className="text-cyan-500 hover:text-gray-400">
              {t('GoToAccount')}
            </Link>
          </div>

          <div className="flex flex-col items-center text-sm lg:text-base">
            <SignOut />
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-5 lg:py-10 xl:px-8">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold">{t('SignIn')}</h1>
            <SwitchLocalization />
          </div>
          <div className="flex flex-col lg:flex-row text-sm lg:text-base">
            <p className="lg:mr-1">{t('ForRegistrations')}</p>
            <Link
              href={
                '/'
                // TODO сделать функционал отправки формы администратору
              }
              className="mb-6 lg:mb-14 text-cyan-700 hover:text-gray-400"
            >
              {t('WriteAdministrator')}
            </Link>
          </div>

          <form className="space-y-6 xl:space-y-10">
            <div className="relative z-0 w-full">
              <input
                ref={loginRef}
                className="input-label peer"
                type="text"
                name="floating_email"
                id="floating_email"
                placeholder=""
                onChange={(event) => {
                  setLogin(event.target.value)
                }}
              />
              <label htmlFor="floating_email" className="label">
                {t('Login')}
              </label>
            </div>
            <div className="relative z-0 w-full">
              <input
                ref={passwordRef}
                name="floating_password"
                id="floating_password"
                className="input-label peer"
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder=" "
                onChange={(event) => {
                  setPassword(event.target.value)
                }}
              />
              <label htmlFor="floating_password" className="label">
                {t('Password')}
              </label>
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
                    <Report className="w-4 h-4" /> {t('WrongLoginPassword')}
                  </p>
                  <a
                    href={
                      '#'
                      // TODO сделать восстановление пароля
                    }
                    className="font-medium underline text-sky-500 hover:text-sky-600"
                  >
                    {t('ForgotPassword')}?
                  </a>
                </>
              )}
            </div>
            <div className="flex flex-col lg:flex-row items-center lg:justify-around">
              <input
                type="submit"
                disabled={loading}
                onClick={handleLogin}
                className={`${
                  loading ? 'btn' : 'btn-cyan'
                } w-1/2 lg:w-1/3 mb-4 lg:mb-0 lg:text-lg font-bold`}
                value={t('SignIn')}
              />
              <Link
                href={
                  '/'
                  // TODO сделать восстановление пароля
                }
                className="text-sm lg:text-base text-cyan-700 hover:text-gray-400"
              >
                {t('RestoreAccess')}
              </Link>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default Login
