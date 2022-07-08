import Head from 'next/head'
import Link from 'next/link'

import { useCurrentUser, useProjects, useUserProjects } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { useEffect, useState } from 'react'

export default function Projects({ languageCode, id }) {
  const { user, session } = useUser()

  const [isAdmin, setIsAdmin] = useState(false)

  const [data] = useCurrentUser({ token: session?.access_token, id: user?.id })
  const [adminProjects] = useProjects({
    token: session?.access_token,
    language_code: languageCode,
  })
  console.log({ data })
  const [userProjects] = useUserProjects({
    token: session?.access_token,
    id: user?.id,
  })
  useEffect(() => {
    if (!data) {
      return
    }

    setIsAdmin(data?.is_admin)
  }, [data])

  const projects = isAdmin ? adminProjects : userProjects
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA projects</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>Проекты:</div>
        {projects &&
          projects?.data &&
          projects.data.map((project) => {
            return (
              <Link key={project.id} href={`/projects/${project.code}`}>
                <a className="block text-blue-600">{`${project.id} ${project.title} ${project.code}`}</a>
              </Link>
            )
          })}
        {isAdmin && (
          <Link href={'/projects/create'}>
            <a className="btn-filled btn">Add New</a>
          </Link>
        )}
      </div>
    </>
  )
}
