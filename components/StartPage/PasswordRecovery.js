import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import ButtonLoading from '../ButtonLoading'
import InputField from '../Panel/UI/InputField'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import Progress from 'public/progress.svg'

function PasswordRecovery() {
  const supabase = useSupabaseClient()
  const { query } = useRouter()
  const { t } = useTranslation('users')
  const { user, loading } = useCurrentUser()
  const [passwords, setPasswords] = useState({ main: '', repeated: '' })
  const mainPasswordRef = useRef(null)
  const repeatedPasswordRef = useRef(null)

  const [isRecovering, setIsRecovering] = useState(false)
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.log(error)
    }
  }
  const comparePasswords = (passwords) => {
    const { main, repeated } = passwords
    if (!main || !repeated) {
      return { error: true, message: 'NotAllFieldsFilled' }
    }
    if (main.length < 6) {
      return { error: true, message: 'PasswordShouldBeLeastSix' }
    }
    if (main !== repeated) {
      return { error: true, message: 'PasswordsDontMatch' }
    }
    return { error: false, message: 'Success' }
  }

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    })
  }
  const handleRecovery = () => {
    const { error, message } = comparePasswords(passwords)
    if (error) {
      setError(message)
      return
    }
    if (user) {
      setIsRecovering(true)
      axios
        .put('/api/users/update_password', {
          password: passwords.main,
        })
        .then((res) => {
          setSuccessResult
          setSuccessResult
          if (res) {
            setSuccessResult(t('PasswordChanged'))
            signOut()
          }
        })
        .catch((error) => {
          setError(error?.response?.data?.error?.message ?? 'ProblemWithRecovery')
          console.log(error)
        })
        .finally(() => setIsRecovering(false))
    }
  }

  useEffect(() => {
    if (mainPasswordRef?.current) {
      mainPasswordRef.current.focus()
    }
  }, [showPassword])

  function renderContent() {
    if (isRecovering) {
      return (
        <div className="flex justify-center">
          <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
        </div>
      )
    }
    if (successResult) {
      return (
        <div className="mx-auto text-center">
          <div className="text-th-text-primary mb-4">{successResult}</div>
          <Link
            className="hover:opacity-70"
            href={{
              pathname: '/',
              query: {
                contentKey: 'signIn',
              },
            }}
          >
            {t('TryLoggingIn')}
          </Link>
        </div>
      )
    }
    if (query?.error) {
      return <div>{t('UnSuccessRecovery')}</div>
    }
    if (loading || isRecovering) {
      return (
        <div className="flex justify-center">
          <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
        </div>
      )
    }
    if (!user) {
      return (
        <Link
          className="hover:opacity-70 text-center"
          href={{
            pathname: '/',
            query: {
              contentKey: 'signIn',
            },
          }}
        >
          {t('TryLoggingIn')}
        </Link>
      )
    }
    const passwordsRender = [
      {
        ref: mainPasswordRef,
        id: 'main_password',
        name: 'main',
        value: passwords.main,
        label: t('TypeNewPassword'),
      },
      {
        ref: repeatedPasswordRef,
        id: 'repeated_password',
        name: 'repeated',
        value: passwords.repeated,
        label: t('RepeatNewPassword'),
      },
    ]
    return (
      <>
        {passwordsRender.map((pass) => (
          <InputField
            key={pass.id}
            refInput={pass.ref}
            type={showPassword ? 'text' : 'password'}
            name={pass.name}
            id={pass.id}
            isError={error && ![pass.value]}
            label={pass.label}
            onChange={handleChange}
            showPasswordToggle={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            className="input-password"
          />
        ))}
        {error && <div className="opacity-100 min-h-[1.5rem]">{t(error)}</div>}
        <ButtonLoading
          type="button"
          className="relative w-full px-5 py-4 rounded-lg text-center text-sm md:text-base font-medium text-th-text-secondary-100 bg-slate-550"
          onClick={handleRecovery}
          isLoading={isRecovering}
        >
          {t('UpdatePassword')}
        </ButtonLoading>
      </>
    )
  }
  useEffect(() => {
    if (repeatedPasswordRef?.current) {
      repeatedPasswordRef.current.focus()
    }
  }, [])

  return (
    <div className="flex flex-col w-full">
      <p className="hidden md:block mr-4">{t('PasswordRecovery')}</p>
      <div
        className="flex flex-grow items-center pb-6 md:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex flex-col w-full space-y-4 text-th-primary-200 text-sm md:text-xl">
          {renderContent()}
        </form>
      </div>
    </div>
  )
}

export default PasswordRecovery
