import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import axios from 'axios'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useCurrentUser } from 'lib/UserContext'

function UserCreatePage() {
  const { user } = useCurrentUser()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState('')
  const router = useRouter()
  const { t } = useTranslation(['users', 'common'])

  useEffect(() => {
    if (!user) {
      return
    }
    if (!user?.is_admin) {
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSaveUser = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/users', { email, password, login })
      .then((res) => {
        setMessage('')
        setLogin('')
        setPassword('')
        setEmail('')
      })
      .catch((err) => {
        setMessage(err?.response?.data?.error?.message)
      })
  }
  return (
    <>
      {!user ? (
        <Link href="/">V-CANA</Link>
      ) : (
        <div>
          <h3>{t('UserCreatePage')}</h3>
          <p>{t('Explanation')}</p>
          <div>{t('Email')}</div>
          <input
            className={'form'}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <div>{t('Password')}</div>
          <input
            className={'form'}
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <div>{t('Login')}</div>
          <input
            className={'form'}
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <br />
          <div className="text-red-500">{message}</div>
          <button className={'btn btn-cyan'} onClick={handleSaveUser}>
            {t('Save')}
          </button>
        </div>
      )}
    </>
  )
}

export default UserCreatePage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}
