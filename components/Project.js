import React from 'react'
import { useProject, useUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function Project({ code }) {
  const { session } = useUser()
  const [project, { mutate }] = useProject({ token: session?.access_token, code })
  const [users] = useUsers(session?.access_token)
  console.log({ project, users })
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
    </div>
  )
}

export default Project
