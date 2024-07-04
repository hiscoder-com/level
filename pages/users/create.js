import { useState } from 'react'

import axios from 'axios'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function UserCreatePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState('')
  const { t } = useTranslation(['users', 'common'])

  const handleSaveUser = () => {
    axios
      .post('/api/users', { email, password, login })
      .then(() => {
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
    <div className="mx-auto max-w-7xl">
      <h3>{t('UserCreatePage')}</h3>
      <p>{t('Explanation')}</p>
      <div>{t('Email')}</div>
      <input
        className="input-primary max-w-sm"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <div>{t('Password')}</div>
      <input
        className="input-primary max-w-sm"
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <div>{t('Login')}</div>
      <input
        className="input-primary max-w-sm"
        type="text"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <br />
      <div className="text-th-secondary">{message}</div>
      <button className="btn-primary mt-4" onClick={handleSaveUser}>
        {t('common:Save')}
      </button>
    </div>
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
