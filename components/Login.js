import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'

import SwitchLocalization from './SwitchLocalization'
import SignOut from './SignOut'
import Modal from './Modal'
import ButtonLoading from './ButtonLoading'

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
  const [errorMessageSendLink, setErrorMessageSendLink] = useState('')
  const [successMessageSendLink, setSuccessMessageSendLink] = useState('')

  const [login, setLogin] = useState('')
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const [email, setEmail] = useState('')

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
    setIsLoadingLogin(true)
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
    } finally {
      setIsLoadingLogin(false)
    }
  }

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }
  const handleSendRecoveryLink = async () => {
    const urlOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    if (!urlOrigin) {
      return
    }
    if (validateEmail(email)) {
      setIsSendingEmail(true)
      axios
        .post('/api/users/send_recovery_link', {
          email,
          url: urlOrigin,
        })
        .then(() => {
          setErrorMessageSendLink('')
          setSuccessMessageSendLink(t('LinkHasSendedToYourEmail'))
          setTimeout(() => {
            setIsOpenModal(false)
          }, 2000)
          setTimeout(() => {
            setSuccessMessageSendLink('')
          }, 2500)
        })
        .catch((error) => {
          setErrorMessageSendLink(t('ErrorSendingLink'))
          console.log(error)
        })
        .finally(() => {
          setIsSendingEmail(false)
          setEmail('')
        })
    } else {
      setErrorMessageSendLink(t('WriteCorrectEmail'))
      return
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
            <Link href={href ?? '/'} className="text-th-primary-link hover:opacity-70">
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
                className="absolute right-2 bottom-2 cursor-pointer stroke-2 stroke-th-primary-icons"
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
                  <p className="flex text-xs text-th-invalid">
                    <Report className="w-4 h-4" /> {t('WrongLoginPassword')}
                  </p>
                  <button
                    type="button"
                    className="underline text-th-primary-link hover:opacity-70"
                    onClick={() => setIsOpenModal(true)}
                  >
                    {t('ForgotPassword')}?
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col lg:flex-row items-center lg:justify-around">
              <ButtonLoading
                disabled={loading}
                onClick={handleLogin}
                isLoading={isLoadingLogin}
                className={`relative w-1/2 lg:w-1/3 mb-4 lg:mb-0 lg:text-lg font-bold ${
                  loading || isLoadingLogin ? 'btn' : 'btn-cyan'
                } `}
              >
                {t('SignIn')}
              </ButtonLoading>
              <button
                type="button"
                className="text-sm lg:text-base text-th-primary-link hover:opacity-70"
                onClick={() => setIsOpenModal(true)}
              >
                {t('RestoreAccess')}
              </button>
            </div>
          </form>
        </div>
      )}
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => setIsOpenModal(false)}
        title={t('PasswordRecovery')}
      >
        {successMessageSendLink ? (
          <div className="text-center mt-7">{successMessageSendLink}</div>
        ) : (
          <div className="flex flex-col gap-7 mb-7 w-full">
            <p className="mt-7">{t('WriteYourEmailRecovery')}</p>
            <div className="flex gap-4">
              <input
                className={errorMessageSendLink ? 'input-invalid' : 'input-primary'}
                onChange={(e) => {
                  setErrorMessageSendLink('')
                  setEmail(e.target.value)
                }}
              />
              <ButtonLoading
                className="relative btn-secondary"
                disabled={!email}
                isLoading={isSendingEmail}
                onClick={handleSendRecoveryLink}
              >
                {t('Send')}
              </ButtonLoading>
            </div>
          </div>
        )}
        <div
          className={`${
            errorMessageSendLink ? 'opacity-100' : 'opacity-0'
          } min-h-[1.5rem]`}
        >
          {errorMessageSendLink}
        </div>
      </Modal>
    </>
  )
}

export default Login
