import Head from 'next/head'
import Link from 'next/link'

import { useProjects } from '../utils/hooks'
import { useUser } from '../lib/UserContext'

export default function Projects({ languageCode }) {
  const { session } = useUser()

  const [projects] = useProjects({
    token: session?.access_token,
    language_id: languageCode,
  })
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA Sign up</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>Проекты:</div>
      { projects?.data &&
        projects.data.map((project) => {
          return (
            <Link key={project.id} href={`/projects/${project.code}`}>
              <a className="block text-blue-600">{`${project.id} ${project.title} ${project.code}`}</a>
            </Link>
          )
        })}
      <Link href={'/projects/create'}>
        <a className="btn-filled btn">Add New</a>
      </Link>
      </div>
     
    </>
  )
}
