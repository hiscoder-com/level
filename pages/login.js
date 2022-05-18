import React, { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [styleLogin, setStyleLogin] = useState(['form'])
  const [stylePassword, setStylePassword] = useState(['form'])
  const [styleBtnReport, setStyleBtnReport] = useState(['w-8/12 btn-transparent'])
  const examinationLogPass = () => {
    const ss = document.getElementById('start')
    if (login === 'qwerty' && password === '1234') {
      setStyleLogin(['form-valid'])
      setStylePassword(['form-valid'])
      setStyleBtnReport(['w-8/12 btn-transparent'])
    }
    if (login !== 'qwerty' && password === '1234') {
      setStyleLogin(['form-invalid active:form'])
      setStylePassword(['form-valid'])
      setStyleBtnReport(['w-8/12 btn-transparent'])
    }
    if (login === 'qwerty' && password !== '1234') {
      setStyleLogin(['form-valid'])
      setStylePassword(['form-invalid'])
      setStyleBtnReport(['w-8/12 btn-transparent'])
    }
    if (login !== 'qwerty' && password !== '1234') {
      ss.removeAttribute('disabled')
      setStyleLogin(['form-invalid focus:form'])
      setStylePassword(['form-invalid'])
      setStyleBtnReport(['w-8/12 btn-transparent'])
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
            onChange={(event) => {
              setLogin(event.target.value)
              setStyleLogin(['form'])
            }}
            // onFocus={() => setStyleLogin(['form'])}
          />
          <input
            className={stylePassword}
            type="password"
            placeholder="Пароль:"
            onChange={(event) => {
              setPassword(event.target.value)
              setStylePassword(['form'])
            }}
            // onFocus={() => setStylePassword(['form'])}
          />
        </form>
        <div className="flex gap-2.5 mt-2 h-9">
          <button id="start" disabled onClick={report} className={styleBtnReport}>
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
