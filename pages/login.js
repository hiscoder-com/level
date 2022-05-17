import React, { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [styleLogin, setStyleLogin] = useState(['form'])
  const [stylePassword, setStylePassword] = useState(['form'])
  const [styleBtnNext, setStyleBtnNext] = useState(['w-4/12 btn-disabled'])
  const [styleBtnReport, setStyleBtnReport] = useState(['w-8/12 btn-disabled'])

  useEffect(() => {
    if (login !== '' && password !== '') {
      setStyleBtnNext(['w-4/12 btn-active-filled'])
    }
  }, [password, login])

  const examinationLogPass = () => {
    if (login === 'qwerty' && password === '1234') {
      setStyleLogin(['form-valid'])
      setStylePassword(['form-valid'])
    }
    if (login !== 'qwerty' && password === '1234') {
      setStyleLogin(['form-invalid active:form'])
      setStylePassword(['form-valid'])
      setStyleBtnReport(['w-8/12 btn-active'])
    }
    if (login === 'qwerty' && password !== '1234') {
      setStyleLogin(['form-valid'])
      setStylePassword(['form-invalid'])
      setStyleBtnReport(['w-8/12 btn-active'])
    }
    if (login !== 'qwerty' && password !== '1234') {
      const ss = document.getElementById('start')
      ss.removeAttribute('disabled')
      setStyleLogin(['form-invalid focus:form'])
      setStylePassword(['form-invalid'])
      setStyleBtnReport(['w-8/12 btn-active'])
    }
  }
  const report = () => {
    alert('Вы написали админу')
  }
  return (
    <div className="container-center f-screen items-center">
      <Head>
        <title>V-CANA login</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-xs">
        <h1 className="h1">Вход:</h1>
        <form className="mt-8 mb-4 space-y-2.5">
          <input
            className={styleLogin}
            type="text"
            placeholder="Логин:"
            onChange={(event) => setLogin(event.target.value)}
          />
          <input
            className={stylePassword}
            type="password"
            placeholder="Пароль:"
            onChange={(event) => setPassword(event.target.value)}
          />
        </form>
        <div className="flex gap-2.5 mt-2 h-9">
          <button id="start" disabled onClick={report} className={styleBtnReport}>
            Написать админу
          </button>
          <button onClick={examinationLogPass} className={styleBtnNext}>
            Далее
          </button>
        </div>
      </div>
    </div>
  )
}
