import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import axios from 'axios'

import Modal from 'components/Modal'
import ButtonLoading from 'components/ButtonLoading'
import InputField from 'components/Panel/UI/InputField'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'

import Report from 'public/error-outline.svg'
import Loading from 'public/progress.svg'
import Close from 'public/close.svg'

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
    <div className="relative flex flex-col w-full">
      <p className="hidden md:block">{t('LoginToAccount')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 -top-12 stroke-black cursor-pointer`}
      />
      <div
        className="flex flex-grow items-center pb-6 md:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {user?.id ? (
          <Loading className="progress-custom-colors mx-auto my-auto inset-0 w-14 animate-spin stroke-th-primary-100" />
        ) : (
          <form className="flex flex-col w-full space-y-4">
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
              <div className="flex flex-col gap-4 lg:flex-row items-center justify-between">
                <p className="flex text-xs text-th-invalid">
                  <Report className="w-4 h-4 mr-1" /> {t('WrongLoginPassword')}
                </p>
                <button
                  type="button"
                  className="underline text-th-primary-200 hover:opacity-70 text-sm md:text-base"
                  onClick={() => setIsOpenModal(true)}
                >
                  {t('ForgotPassword')}?
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row items-center pt-1">
              <ButtonLoading
                disabled={loading}
                onClick={handleLogin}
                isLoading={isLoadingLogin}
                className="relative w-full lg:w-1/2 px-5 py-4 rounded-lg text-center text-sm md:text-base font-medium text-th-text-secondary-100 bg-slate-550"
              >
                {t('SignIn')}
              </ButtonLoading>
              <button
                type="button"
                className="w-full lg:w-1/2 py-4 text-sm md:text-base font-medium text-gray-300 hover:text-th-primary-100"
                onClick={() => setIsOpenModal(true)}
              >
                {t('RestoreAccess')}
              </button>
            </div>

            <p className="text-base text-center font-medium">
              {t('RegistrationTextStart')}{' '}
              <span className="text-th-primary-200 cursor-pointer" onClick={handleClick}>
                {t('RegistrationTextEnd')}
              </span>
            </p>
          </form>
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
          <div className={`${errorMessageSendLink ? '' : 'hidden'} `}>
            {errorMessageSendLink}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Login
