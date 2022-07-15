import Head from 'next/head'
import Link from 'next/link'

import { useAuthenticated, useProjects, useUserProjects } from '@/utils/hooks'
import { useUser } from '../lib/UserContext'

export default function Projects({ languageCode }) {
  const { user, session } = useUser()

  const [authenticated] = useAuthenticated({ token: session?.access_token, id: user?.id })

  const [adminProjects] = useProjects({
    token: session?.access_token,
    language_code: languageCode,
  })

  const [userProjects] = useUserProjects({
    token: session?.access_token,
    id: user?.id,
  })

  const projects = authenticated?.is_admin ? adminProjects : userProjects
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA projects</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>{`${authenticated?.is_admin ? 'Проекты' : 'Мои проекты'}`}</div>
        {projects &&
          projects.map((project) => {
            return (
              <Link key={project.id} href={`/projects/${project.code}`}>
                <a className="block text-blue-600">{`${project.id} ${project.title} ${project.code}`}</a>
              </Link>
            )
          })}
        {authenticated?.is_admin && (
          <Link href={'/projects/create'}>
            <a className="btn-filled btn">Add New</a>
          </Link>
        )}
      </div>
    </>
  )
}
