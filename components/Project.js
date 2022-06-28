import React from 'react'
import { useProject, useUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import axios from 'axios'

function Project({ code }) {
  const { session } = useUser()
  const [project, { mutate }] = useProject({ token: session?.access_token, code })
  const [users] = useUsers(session?.access_token)
  console.log({ project, users })
  return <div>Project - {code}</div>
}

export default Project
