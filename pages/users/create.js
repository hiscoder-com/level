import axios from 'axios'
import { useUser } from '../../lib/UserContext'
import { useState } from 'react'

function UserCreatePage() {
  const { session } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const handleSaveUser = () => {
    axios.defaults.headers.common['token'] = session?.access_token
    axios.post('/api/users', { email, password, userName }).then((res) => {})
  }
  return (
    <div>
      <h3>UserCreatePage</h3>
      <p>
        Создавать может только админ, по этому надо убедиться что доступ к этой странице
        ограничен
      </p>
      <input
        className={'form'}
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />{' '}
      <br />
      <input
        className={'form'}
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />{' '}
      <br />
      <input
        className={'form'}
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />{' '}
      <br />
      <button className={'btn btn-cyan'} onClick={handleSaveUser}>
        Save
      </button>
    </div>
  )
}

export default UserCreatePage
