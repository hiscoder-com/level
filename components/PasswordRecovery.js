import { useState } from 'react'

import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'

import { useCurrentUser } from 'lib/UserContext'

function PasswordRecovery() {
  const { t } = useTranslation('users')
  const { user } = useCurrentUser()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successResult, setSuccessResult] = useState(null)
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
      <div className="flex flex-col lg:flex-row text-sm lg:text-base">
        <p className="lg:mr-1">{t('ForRegistrations')}</p>
        <Link
          href={
            '/'
            // TODO сделать функционал отправки формы администратору
          }
        >
          <a className="mb-6 lg:mb-14 text-cyan-700 hover:text-gray-400">
            {t('WriteAdministrator')}
          </a>
        </Link>
      </div>

      {user && (
        <form className="space-y-6 xl:space-y-10">
          <div className="flex flex-col items-center gap-7 lg:justify-around">
            {!successResult ? (
              <>
                <input
                  className={`${error ? '!border-red-500' : ''}  input-primary`}
                  onChange={(e) => {
                    setError('')
                    setSuccessResult('')
                    setPassword(e.target.value)
                  }}
                />
                <div className={`${error ? 'opacity-100' : 'opacity-0'} min-h-[1.5rem]`}>
                  {error}
                </div>

                <button
                  type="button"
                  className="btn-cyan text-sm lg:text-bas"
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
