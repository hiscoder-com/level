import Head from 'next/head'
import Link from 'next/link'

import { useCurrentUser, useProjects, useUserProjects } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { useEffect, useState } from 'react'

export default function Projects({ languageCode }) {
  const { user, session } = useUser()

  const [currentUser] = useCurrentUser({ token: session?.access_token, id: user?.id })

  const [adminProjects] = useProjects({
    token: session?.access_token,
    language_code: languageCode,
  })

  const [userProjects] = useUserProjects({
    token: session?.access_token,
    id: user?.id,
  })

  const projects = currentUser?.is_admin ? adminProjects : userProjects
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA projects</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>{`${currentUser?.is_admin ? 'Проекты' : 'Мои проекты'}`}</div>
        {projects &&
          projects?.data &&
          projects.data.map((project) => {
            return (
              <Link key={project.id} href={`/projects/${project.code}`}>
                <a className="block text-blue-600">{`${project.id} ${project.title} ${project.code}`}</a>
              </Link>
            )
          })}
        {currentUser?.is_admin && (
          <Link href={'/projects/create'}>
            <a className="btn-filled btn">Add New</a>
          </Link>
        )}
      </div>
    </>
  )
}
