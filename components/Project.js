import React, { useEffect, useState } from 'react'
import {
  useCoordinators,
  useAuthenticated,
  useProject,
  useProjectRole,
  useRoles,
  useTranslators,
  useUsers,
} from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'
import Link from 'next/link'

function Project({ code }) {
  const { user, session } = useUser()

  const [authenticated] = useAuthenticated({ token: session?.access_token, id: user?.id })

  const [project] = useProject({ token: session?.access_token, code })

  const [translators] = useTranslators({
    token: session?.access_token,
    code: project?.code,
  })

  const projectRole = useProjectRole({
    token: session?.access_token,
    code,
    userId: user?.id,
    isAdmin: authenticated?.is_admin,
  })
  // const handleSetCoordinator = async () => {
  //   if (!project?.id || !userId) {
  //     alert('неправильный координатор')
  //     return
  //   }
  //   axios.defaults.headers.common['token'] = session?.access_token
  //   axios
  //     .post('/api/languages/ru/projects/rlob/coordinators', {
  //       user_id: userId,
  //       project_id: project?.id,
  //     })
  //     .then((result) => {
  //       const { data, status } = result

  //       //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
  //     })
  //     .catch((error) => console.log(error, 'from axios'))
  // }
  return (
    <div>
      <h3 className="text-3xl">
        <b>{project?.title}</b>
      </h3>

      <div>
        Code <b>{project?.code}</b>
      </div>
      <div>
        Language <b>{project?.languages?.orig_name + ' '}</b>
        <b>{project?.languages?.code}</b>
      </div>

      <div>
        {translators && (
          <>
            Translators:
            {translators.data.map((el, key) => {
              return (
                <div
                  className="font-bold"
                  key={key}
                >{`${el.users.login} ${el.users.email}`}</div>
              )
            })}
          </>
        )}
        {authenticated?.isAdmin ||
          (['admin', 'coordinator', 'moderator'].includes(projectRole) && (
            <Link key={project?.id} href={`/projects/${project?.code}/edit`}>
              <a className="btn btn-filled btn-cyan">Редактирование проекта</a>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Project
