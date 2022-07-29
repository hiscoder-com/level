import Head from 'next/head'
import Link from 'next/link'

import { useProjects, useUserProjects } from '@/utils/hooks'
import { useCurrentUser } from '../lib/UserContext'

export default function Projects({ languageCode }) {
  const { user } = useCurrentUser()

  const [adminProjects] = useProjects({
    token: user?.access_token,
    language_code: languageCode,
  })

  const [userProjects] = useUserProjects({
    token: user?.access_token,
    id: user?.id,
  })

  const projects = user?.is_admin ? adminProjects : userProjects
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA projects</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>{`${user?.is_admin ? 'Проекты' : 'Мои проекты'}`}</div>
        {projects &&
          projects.map((project) => {
            return (
              <Link key={project.id} href={`/projects/${project.code}`}>
                <a className="block text-blue-600">{`${project.id} ${project.title} ${project.code}`}</a>
              </Link>
            )
          })}
      </div>
    </>
  )
}
