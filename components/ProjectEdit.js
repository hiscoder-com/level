import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import { useLanguages, useMethod, useUserProjectRole } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function ProjectEdit({ code }) {
  const router = useRouter()

  const { user, session } = useUser()
  const [languages, { mutate }] = useLanguages(session?.access_token)
  const [projects] = useUserProjectRole({
    token: session?.access_token,
    code,
    id: user?.id,
  })

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
      .post('/api/languages/ru/projects', {
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
        <input className="btn btn-cyan btn-filled" type="submit" />
      </form>
    </div>
  )
}

export default ProjectEdit
