import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import { useLanguages, useMethod } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function ProjectCreate() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const onSubmit = (data) => console.log(data, 'data')
  console.log(errors, 'errors')

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
  const projectTypes = ['obs', 'bible']

  const create = async () => {
    if (!title || !languageId || !code || !methodId || !type) {
      setStyleTitle('form-invalid')
      return
    }
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

        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>Имя проекта</div>
        <input
          onBlur={(e) => setTitle(e.target.value)}
          className={`${styleTitle} max-w-sm`}
        />
        <div>Код проекта</div>
        <input
          onBlur={(e) => setCode(e.target.value)}
          className={`${styleTitle} max-w-sm`}
          placeholder="Identifier"
          {...register('Identifier', {
            required: true,
            minLength: 3,
            maxLength: 4,
            pattern: /^[a-z]+$/i,
          })}
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
        <input className="btn btn-cyan btn-filled" type="submit" />
      </form>
    </div>
  )
}

export default ProjectCreate
