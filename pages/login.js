/* eslint-disable react/jsx-key */
import React, { useState } from 'react'
import Report from '../public/report.svg'
import EyeIcon from '../public/EyeIcon.svg'
import EyeOffIcon from '../public/EyeOffIcon.svg'

export default function Login() {
  const [errorText, setErrorText] = useState('')
  const [remindBtn, setRemindBtn] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [styleLogin, setStyleLogin] = useState('form')
  const [stylePassword, setStylePassword] = useState('form')
  const [formValid, setFormValid] = useState(false)
  const [passType, setPassType] = useState('password')
  const [svg, setSvg] = useState([<EyeIcon />])

  const examinationLogPass = () => {
    if (login === 'qwerty' && password === '1234') {
      setStyleLogin('form-valid')
      setStylePassword('form-valid')
      setErrorText('')
      setRemindBtn('')
    } else {
      setStyleLogin('form-invalid')
      setStylePassword('form-invalid')
      setFormValid(true)
      setErrorText([<Report />, 'Неверный логин или пароль'])
      setRemindBtn('Забыли пароль?')
    }
  }
  const report = () => {
    alert('Вы написали админу')
  }
  const showHidePassword = () => {
    if (passType == 'password') {
      setPassType('text')
      setSvg([<EyeOffIcon />])
    } else {
      setPassType('password')
      setSvg([<EyeIcon />])
    }
  }
  return (
    <div className="LTAppbar">
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
          <button onClick={examinationLogPass} className="w-4/12 btn-filled">
            Далее
          </button>
        </div>
      </div>
    </div>
  )
}
Login.layoutType = 'appbarStart'
