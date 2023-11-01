import { useEffect, useState } from 'react'

import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'
import ButtonLoading from './ButtonLoading'

import useSupabaseClient from 'utils/supabaseClient'
import { useCurrentUser } from 'lib/UserContext'

import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'

function PasswordRecovery() {
  const supabase = useSupabaseClient()
  const { t } = useTranslation('users')
  const { user } = useCurrentUser()
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.log(error)
    }
  }
  const comparePasswords = (passFirst, passSecond) => {
    if (!passFirst || !passSecond) {
      return { error: true, message: 'NotAllFieldsFilled' }
    }
    if (passFirst.length < 6) {
      return { error: true, message: 'PasswordShouldBeLeastSix' }
    }
    if (passFirst !== passSecond) {
      return { error: true, message: 'PasswordsDontMatch' }
    }
    return { error: false, message: 'Success' }
  }
  const handleRecovery = () => {
    const { error, message } = comparePasswords(password, repeatPassword)
    if (error) {
      setError(message)
      return
    }
    if (user) {
      setIsRecovering(true)
      axios
        .put('/api/users/update_password', {
          password,
        })
        .then((res) => {
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

  return (
    <div className="flex flex-col p-5 lg:py-10 xl:px-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('PasswordRecovery')}</h1>
        <SwitchLocalization />
      </div>
      <form className="space-y-6 xl:space-y-10">
        <div className="flex flex-col gap-5 lg:justify-around">
          {!successResult ? (
            user && (
              <>
                <p>{t('WriteNewPassword')}</p>
                <div className="relative z-0 w-full">
                  <input
                    name="floating_password_new"
                    className={error ? 'input-invalid' : 'input-primary'}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setError('')
                      setSuccessResult('')
                      setPassword(e.target.value)
                    }}
                  />

                  <span
                    className="absolute right-2 bottom-2 cursor-pointer stroke-2 text-th-icons-primary"
                    onClick={() => {
                      setShowPassword((prev) => !prev)
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>
                <p>{t('RepeatNewPassword')}</p>
                <div className="relative z-0 w-full">
                  <input
                    name="floating_password_repeat"
                    className={error ? 'input-invalid' : 'input-primary'}
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={repeatPassword}
                    onChange={(e) => {
                      setError('')
                      setSuccessResult('')
                      setRepeatPassword(e.target.value.trim())
                    }}
                  />

                  <span
                    className="absolute right-2 bottom-2 cursor-pointer stroke-2 text-th-icons-primary"
                    onClick={() => setShowRepeatPassword((prev) => !prev)}
                  >
                    {showRepeatPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>

                <div className={`${error ? 'opacity-100' : 'opacity-0'} min-h-[1.5rem]`}>
                  {t(error)}
                </div>
                <ButtonLoading
                  type="button"
                  className="btn-cyan relative self-center w-1/2 text-sm lg:text-base"
                  onClick={handleRecovery}
                  isLoading={isRecovering}
                >
                  {t('UpdatePassword')}
                </ButtonLoading>
              </>
            )
          ) : (
            <>
              <div>{successResult}</div>
              <Link
                href={'/'}
                className="mb-6 lg:mb-14 text-th-link hover:text-th-link-hover"
              >
                {t('GoToLogin')}
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export default PasswordRecovery
