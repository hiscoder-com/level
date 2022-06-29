import React, { useState } from 'react'
import { useCoordinator, useProject, useUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function Project({ code }) {
  const [userId, setUserId] = useState(null)
  const { session } = useUser()

  const [project, { mutate }] = useProject({ token: session?.access_token, code })
  const [coordinator] = useCoordinator({ token: session?.access_token, id: project?.id })
  const [users] = useUsers(session?.access_token)
  console.log({ project, users: users && Object.values(users), coordinator })

  const handleSetCoordinator = async () => {
    if (!project?.id || !userId) {
      alert('неправильный координатор')
      return
    }
    axios.defaults.headers.common['token'] = session?.access_token
    axios
      .post('/api/coordinators', {
        user_id: userId,
        project_id: project?.id,
      })
      .then((result) => {
        const { data, status } = result

        //TODO обработать статус и дата если статус - 201, тогда сделать редирект route.push(headers.location)
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  return (
    <div>
      <h3>Project</h3>
      <p>
        Title <b>{project?.title}</b>
      </p>
      <p>
        Code <b>{project?.code}</b>
      </p>
      <p>
        Language <b>{project?.languages?.orig_name}</b>
      </p>
      <p>
        Method <b>{project?.methods?.title}</b>
      </p>
      <p>
        type <b>{project?.type}</b>
      </p>
      <p>
        Coordinator
        <b>
          {coordinator && Object.keys(coordinator).length > 0
            ? coordinator?.users?.email
            : ' not assigned'}
        </b>
        <select onChange={(e) => setUserId(e.target.value)} className="form max-w-sm">
          {users &&
            Object.values(users).map((el) => {
              return (
                <option key={el.id} value={el.id}>
                  {el.email}
                </option>
              )
            })}
        </select>
        <button onClick={handleSetCoordinator} className="btn btn-cyan btn-filled">
          Set coordinator
        </button>
      </p>
    </div>
  )
}

export default Project
