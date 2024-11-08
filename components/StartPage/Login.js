import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'

import ButtonLoading from 'components/ButtonLoading'
import Modal from 'components/Modal'
import InputField from 'components/Panel/UI/InputField'

import { useCurrentUser } from 'lib/UserContext'

import useSupabaseClient from 'utils/supabaseClient'

import Close from 'public/icons/close.svg'
import Report from 'public/icons/error-outline.svg'
import Loading from 'public/icons/progress.svg'

function Login({ handleClick = () => {} }) {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { t } = useTranslation('users')
  const { user, loading } = useCurrentUser()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessageSendLink, setErrorMessageSendLink] = useState('')
  const [successMessageSendLink, setSuccessMessageSendLink] = useState('')
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const passwordRef = useRef(null)
  const loginRef = useRef(null)

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
      setIsError(false)
      router.push(agreement && confession ? `/account` : '/agreements')
    }
  }, [router, user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoadingLogin(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: login,
        password,
      })
      if (error) throw error
      setIsError(false)
    } catch (error) {
      setIsError(true)
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
    <div className="relative flex w-full flex-col">
      <p className="hidden md:block">{t('LoginToAccount')}</p>
      <Close
        className={`absolute -top-12 right-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
        onClick={(e) => {
          e.stopPropagation()
          router.push('/')
        }}
      />
      <div
        className="flex flex-grow items-center pb-6 md:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {user?.id ? (
          <Loading className="progress-custom-colors inset-0 mx-auto my-auto w-14 animate-spin stroke-th-primary-100" />
        ) : (
          <form className="flex w-full flex-col space-y-4">
            <InputField
              refInput={loginRef}
              type="text"
              name="floating_email"
              id="floating_email"
              value={login}
              isError={isError && !login}
              label={t('Login')}
              onChange={(event) => setLogin(event.target.value)}
              className="input-base-label"
            />

            <InputField
              refInput={passwordRef}
              type={showPassword ? 'text' : 'password'}
              name="floating_password"
              id="floating_password"
              value={password}
              isError={isError && !password}
              label={t('Password')}
              onChange={(event) => setPassword(event.target.value)}
              showPasswordToggle={true}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              className="input-password"
            />

            {isError && (
              <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                <p className="flex text-xs text-th-invalid">
                  <Report className="mr-1 h-4 w-4" /> {t('WrongLoginPassword')}
                </p>
                <button
                  type="button"
                  className="text-sm text-th-primary-200 underline hover:opacity-70 md:text-base"
                  onClick={() => setIsOpenModal(true)}
                >
                  {t('ForgotPassword')}?
                </button>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 pt-1 lg:flex-row">
              <ButtonLoading
                disabled={loading}
                onClick={handleLogin}
                isLoading={isLoadingLogin}
                className="relative w-full rounded-lg bg-slate-550 px-5 py-4 text-center text-sm font-medium text-th-text-secondary-100 md:text-base lg:w-1/2"
              >
                {t('SignIn')}
              </ButtonLoading>
              <button
                type="button"
                className="w-full py-4 text-sm font-medium text-gray-300 hover:text-th-primary-100 md:text-base lg:w-1/2"
                onClick={() => setIsOpenModal(true)}
              >
                {t('RestoreAccess')}
              </button>
            </div>

            <p className="text-center text-base font-medium">
              {t('RegistrationTextStart')}{' '}
              <Link
                href="/connect-with-us"
                shallow
                className="cursor-pointer text-th-primary-200"
                onClick={handleClick}
              >
                {t('RegistrationTextEnd')}
              </Link>
            </p>
          </form>
        )}
        <Modal
          isOpen={isOpenModal}
          closeHandle={() => setIsOpenModal(false)}
          title={t('PasswordRecovery')}
        >
          {successMessageSendLink ? (
            <div className="mt-7 text-center">{successMessageSendLink}</div>
          ) : (
            <div className="mb-7 flex w-full flex-col gap-7">
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
                  className="btn-secondary relative"
                  disabled={!email}
                  isLoading={isSendingEmail}
                  onClick={handleSendRecoveryLink}
                >
                  {t('Send')}
                </ButtonLoading>
              </div>
            </div>
          )}
          <div className={`${errorMessageSendLink ? '' : 'hidden'} `}>
            {errorMessageSendLink}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Login
