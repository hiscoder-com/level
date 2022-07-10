import React, { useEffect, useState } from 'react'
import {
  useCoordinators,
  useCurrentUser,
  useProject,
  useRoles,
  useUserProjectRole,
  useUsers,
} from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'
import Link from 'next/link'

function Project({ code }) {
  const { user } = useUser()
  const { session } = useUser()
  const [currentUser] = useCurrentUser({ token: session?.access_token, id: user?.id })
  const [userId, setUserId] = useState(null)

  const [project] = useProject({ token: session?.access_token, code })
  const [userProjectRoles] = useUserProjectRole({
    token: session?.access_token,
    code,
    id: user?.id,
  })
  const rolesCurrentUser = userProjectRoles?.data.map((el) => el.role)
  const [projectRole, setProjectRole] = useState(null)

  useEffect(() => {
    if (!rolesCurrentUser) {
      return
    }

    if (rolesCurrentUser.length === 0) {
      return
    }
    if (projectRole === 'admin') {
      return
    }
    const arr = ['coordinator', 'moderator', 'translator']
    for (let i = 0; i < arr.length; ++i) {
      if (rolesCurrentUser.includes(arr[i])) {
        setProjectRole(arr[i])
        break
      }
    }
  }, [rolesCurrentUser])
  const [roles] = useRoles({
    token: session?.access_token,
    code: project?.code,
  })
  const [coordinators] = useCoordinators({
    token: session?.access_token,
    code: project?.code,
  })
  const [users] = useUsers(session?.access_token)
  console.log(project)
  const handleSetCoordinator = async () => {
    if (!project?.id || !userId) {
      alert('неправильный координатор')
      return
    }
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/languages/ru/projects/rlob/coordinators', {
        user_id: userId,
        project_id: project?.id,
      })
      .then((result) => {
        const { data, status } = result

        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }
  console.log(projectRole)
  return (
    <div>
      <h3>Project</h3>
      <div>
        Title <b>{project?.title}</b>
      </div>
      <div>
        Code <b>{project?.code}</b>
      </div>
      <div>
        Language <b>{project?.languages?.orig_name}</b>
      </div>
      <div>
        Method <b>{project?.methods?.title}</b>
      </div>
      <div>
        type <b>{project?.type}</b>
      </div>
      <div>
        {roles && (
          <>
            {roles.data.map((el, key) => {
              return (
                <div key={key}>{`${el.role} ${el.users.login} ${el.users.email}`}</div>
              )
            })}
          </>
        )}
        {currentUser?.isAdmin ||
          (['coordinator', 'moderator'].includes(projectRole) && (
            <Link
              key={project?.id}
              href={`/projects/${project?.code}/edit/${projectRole}`}
            >
              <a className="btn btn-filled btn-cyan">Редактирование проекта</a>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Project
