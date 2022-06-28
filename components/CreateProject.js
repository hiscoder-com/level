import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useLanguages, useMethod, useAllUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function CreateProject() {
  const router = useRouter()
  const [languageId, setLanguageId] = useState(null)
  const [title, setTitle] = useState('')

  const [styleTitle, setStyleTitle] = useState('form')
  const [methodId, setMethodId] = useState(null)
  const [type, setType] = useState(null)
  const [code, setCode] = useState(null)

  const { user, session } = useUser()
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const [methods] = useMethod(session?.access_token)
  const [users] = useAllUsers(session?.access_token)
  const projectTypes = ['obs', 'bible']

  const create = async () => {
    if (!title || !languageId || !code || !methodId || !type) {
      setStyleTitle('form-invalid')
      return
    }
    console.log({ title, languageId, code, methodId, type })
    setStyleTitle('form')
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/projects', {
        title,
        language_id: languageId,
        code,
        method_id: methodId,
        type,
      })
      .then((result) => {
        const {
          data,
          status,
          headers: { location },
        } = result
        if (status === 201) {
          router.push(location)
        }
        console.log({ data, status, location })
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
      <select onChange={(e) => setLanguageId(e.target.value)} className="form max-w-sm">
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
          setMethodId(e.target.value)
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
