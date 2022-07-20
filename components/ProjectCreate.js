import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import { useLanguages, useMethod } from '@/utils/hooks'
import { useCurrentUser } from '../lib/UserContext'
import axios from 'axios'

function ProjectCreate() {
  const router = useRouter()

  const { session } = useCurrentUser()
  const [languages] = useLanguages(session?.access_token)
  const [methods] = useMethod(session?.access_token)
  const projectTypes = ['obs', 'bible']

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange' })
  const onSubmit = async (data) => {
    const { title, code, languageId, methodId, type } = data
    if (!title || !code || !languageId || !methodId || !type) {
      return
    }
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/[lang]/projects', {
        title,
        language_id: languageId,
        code,
        method_id: methodId,
        type,
      })
      .then((result) => {
        const {
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

  const inputs = [
    {
      id: 1,
      title: 'Имя проекта',
      classname: errors?.title ? 'input-invalid' : 'input',
      placeholder: 'Title',
      register: {
        ...register('title', {
          required: true,
          pattern: {
            value: /^(?! )[A-za-z\s]+$/i,
            message: 'You need type just latins symbols',
          },
        }),
      },
      errorMessage: errors?.title ? errors?.title.message : '',
    },
    {
      id: 2,
      title: 'Код проекта',
      classname: errors?.code ? 'input-invalid' : 'input',
      placeholder: 'Code',
      register: {
        ...register('code', {
          required: true,
          minLength: { value: 3, message: 'Need more than 3 characters' },
          maxLength: { value: 4, message: 'Need less than 3 characters' },
          pattern: {
            value: /^(?! )[a-z]+$/i,
            message: 'only small letters of the Latin alphabet are needed',
          },
        }),
      },
      errorMessage: errors?.code ? errors?.code.message : '',
    },
  ]

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {inputs.map((el) => {
          return (
            <div key={el.title}>
              <div>{el.title}</div>
              <input
                className={`${el.classname} max-w-sm`}
                placeholder={el.placeholder}
                {...el.register}
              />
              {el.errorMessage && <span>{' ' + el.errorMessage}</span>}
            </div>
          )
        })}

        <div>Язык</div>
        <select
          className="input max-w-sm"
          placeholder="Language"
          {...register('languageId')}
        >
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
        <select placeholder="Method" {...register('methodId')} className="input max-w-sm">
          {methods &&
            methods.data.map((el) => {
              return (
                <option key={el.id} value={el.id}>
                  {el.title}
                </option>
              )
            })}
        </select>
        <select {...register('type')} className="input max-w-sm">
          {projectTypes &&
            projectTypes.map((el) => {
              return (
                <option key={el} value={el}>
                  {el}
                </option>
              )
            })}
        </select>

        <input className="btn-cyan btn-filled" type="submit" />
      </form>
    </div>
  )
}

export default ProjectCreate
