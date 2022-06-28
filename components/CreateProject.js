import React, { useState } from 'react'
import { useLanguages, useMethod, useAllUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'
function CreateProject() {
  const [language, setLanguage] = useState(null)
  const [title, setTitle] = useState('')

  const [styleTitle, setStyleTitle] = useState('form')
  const [method, setMethod] = useState(null)
  const [type, setType] = useState(null)
  const [code, setCode] = useState(null)

  const { user, session } = useUser()
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const [methods] = useMethod(session?.access_token)
  const [users] = useAllUsers(session?.access_token)
  const projectTypes = ['obs', 'bible']

  const create = async () => {
    if (!title || !language || !code || !method || !type) {
      setStyleTitle('form-invalid')
      return
    }

    setStyleTitle('form')
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/projects', { title, language, code, method, type })
      .then((result) => {
        const { data, status, headers } = result
        console.log({ data, status, headers })
        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  return (
    <div>
      <div>Имя проекта</div>
      <input
        onBlur={(e) => setTitle(e.target.value)}
        className={`${styleTitle} max-w-sm`}
      />
      <div>Код проекта</div>
      <input
        onBlur={(e) => setCode(e.target.value)}
        className={`${styleTitle} max-w-sm`}
      />
      <div>Язык</div>
      <select onChange={(e) => setLanguage(e.target.value)} className="form max-w-sm">
        placeholder={'Choose your language'}
        {languages &&
          languages.map((el) => {
            return (
              <option key={el.id} value={el.id}>
                {el.orig_name}
              </option>
            )
          })}
      </select>
      <div>Метод</div>
      <select
        onChange={(e) => {
          setMethod(e.target.value)
        }}
        className="form max-w-sm"
      >
        {methods &&
          methods.data.map((el) => {
            return (
              <option key={el.id} value={el.id}>
                {el.title}
              </option>
            )
          })}
      </select>
      <select onChange={(e) => setType(e.target.value)} className="form max-w-sm">
        {projectTypes &&
          projectTypes.map((el) => {
            return (
              <option key={el} value={el}>
                {el}
              </option>
            )
          })}
      </select>
      <button onClick={create} className="btn btn-cyan btn-filled">
        Создать проект
      </button>
    </div>
  )
}

export default CreateProject
