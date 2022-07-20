import { useState } from 'react'

import axios from 'axios'

import { useCurrentUser } from '../../lib/UserContext'

function UserCreatePage() {
  const { user } = useCurrentUser()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [login, setLogin] = useState('')
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
    <div>
      <h3>UserCreatePage</h3>
      <p>
        Создавать может только админ, по этому надо убедиться что доступ к этой странице
        ограничен
      </p>
      <div>Email</div>
      <input
        className={'form'}
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <div>Password</div>
      <input
        className={'form'}
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <div>Login</div>
      <input
        className={'form'}
        type="text"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <br />
      <div className="text-red-500">{message}</div>
      <button className={'btn btn-cyan'} onClick={handleSaveUser}>
        Save
      </button>
    </div>
  )
}

export default UserCreatePage
