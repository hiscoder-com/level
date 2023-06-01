import { useState } from 'react'

import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'

import { useCurrentUser } from 'lib/UserContext'

import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'

function PasswordRecovery() {
  const { t } = useTranslation('users')
  const { user } = useCurrentUser()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const handleRecovery = () => {
    if (!password) {
      setError(t('PasswordShouldBeLong'))
      return
    }

    if (user) {
      try {
        axios.defaults.headers.common['token'] = user?.access_token
        axios
          .put('/api/users/update_password', {
            password,
          })
          .then((res) => {
            if (res) {
              setSuccessResult(t('PasswordChanged'))
            }
          })
          .catch((error) => {
            if (error.response.status === 422) {
              setError(t('PasswordShouldBeLong'))
            } else {
              setError(t('ProblemWithRecovery'))
            }
            console.log(error)
          })
      } catch (error) {
        setError(t('ProblemWithRecovery'))
        console.log(error)
      }
    }
  }

  return (
    <div className="flex flex-col p-5 lg:py-10 xl:px-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold">
          {t('PasswordRecovery')}
        </h1>
        <SwitchLocalization />
      </div>

      {user && (
        <form className="space-y-6 xl:space-y-10">
          <div className="flex flex-col gap-5 lg:justify-around">
            {!successResult ? (
              <>
                <p>{t('WriteNewPassword')}</p>
                <div className="relative z-0 w-full">
                  <input
                    name="floating_password"
                    id="floating_password"
                    className={`input-primary ${error ? '!border-red-500' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder=" "
                    onChange={(e) => {
                      setError('')
                      setSuccessResult('')
                      setPassword(e.target.value)
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

                <div className={`${error ? 'opacity-100' : 'opacity-0'} min-h-[1.5rem]`}>
                  {error}
                </div>

                <button
                  type="button"
                  className="btn-cyan self-center w-1/2 text-sm lg:text-base"
                  onClick={handleRecovery}
                >
                  {t('UpdatePassword')}
                </button>
              </>
            ) : (
              <>
                <div>{successResult}</div>
                <Link href={'/'}>
                  <a className="mb-6 lg:mb-14 text-cyan-700 hover:text-gray-400">
                    {t('GoToLogin')}
                  </a>
                </Link>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default PasswordRecovery
