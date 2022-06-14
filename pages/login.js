import { useState } from 'react'

import { useUser } from '../lib/UserContext'
import { supabase } from '../utils/supabaseClient'
import Report from '../public/report.svg'
import EyeIcon from '../public/eye-icon.svg'
import EyeOffIcon from '../public/eye-off-icon.svg'

export default function Login({ bgBlue, setBgBlue }) {
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [remindBtn, setRemindBtn] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [styleLogin, setStyleLogin] = useState('form')
  const [stylePassword, setStylePassword] = useState('form')
  const [formValid, setFormValid] = useState(false)
  const [passType, setPassType] = useState('password')
  const [svg, setSvg] = useState([<EyeIcon key={1} />])
  const { user, session } = useUser()

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { user, error } = await supabase.auth.signIn({
        email: login,
        password,
      })
      if (error) throw error
      setStyleLogin('form-valid')
      setStylePassword('form-valid')
      setErrorText('')
      setRemindBtn('')
    } catch (error) {
      setStyleLogin('form-invalid')
      setStylePassword('form-invalid')
      setFormValid(true)
      setErrorText([<Report key={2} />, 'Неверный логин или пароль'])
      setRemindBtn('Забыли пароль?')
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const report = () => {
    alert('Вы написали админу')
  }
  const showHidePassword = () => {
    if (passType == 'password') {
      setPassType('text')
      setSvg([<EyeOffIcon key={3} />])
    } else {
      setPassType('password')
      setSvg([<EyeIcon key={4} />])
    }
  }
  return (
    <div className="layout-appbar">
      {user ? (
        <div className="flex flex-col text-center">
          <div>{`Добро пожаловать в V-Cana ${user.email} `} </div>

          <a classhref="#" onClick={() => supabase.auth.signOut()}>
            {' Logout'}
          </a>
        </div>
      ) : (
        <div>
          <p className="h1 mb-8">Вход:</p>
          <form className="relative mb-2 space-y-2.5">
            <input
              className={styleLogin}
              type="text"
              placeholder="Логин:"
              onChange={(event) => {
                setLogin(event.target.value)
                setStyleLogin('form')
              }}
            />
            <input
              className={stylePassword}
              type={passType}
              value={password.slice(0, 40)}
              placeholder="Пароль:"
              onChange={(event) => {
                setPassword(event.target.value)
                setStylePassword('form')
              }}
            />
            <span className="eye cursor-pointer" onClick={showHidePassword}>
              {svg}
            </span>
          </form>
          <div className="flex items-center justify-between mb-4">
            <p className="flex text-xs text-red-600">{errorText}</p>
            <a href="#" className="font-medium underline text-sky-500 hover:text-sky-600">
              {remindBtn}
            </a>
          </div>
          <div className="flex gap-2.5 h-9">
            <button
              disabled={!formValid}
              onClick={report}
              className="w-8/12 btn-transparent"
            >
              Написать админу
            </button>
            <button onClick={handleLogin} className="w-4/12 btn-filled">
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
Login.layoutType = 'appbarStart'
