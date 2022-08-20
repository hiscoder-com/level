import Head from 'next/head'
import Link from 'next/link'

import { useProjects, useUserProjects } from '@/utils/hooks'
import { useCurrentUser } from '../lib/UserContext'

import Translators from './Translators'

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
        <div className="text-3xl mb-5">
          {`${user?.is_admin ? 'Проекты' : 'Мои проекты'}`}:
        </div>
        <div className="grid grid-cols-1 gap-7 my-5 sm:grid-cols-1 md:grid-cols-2 md:my-10 xl:grid-cols-3">
          {projects &&
            projects.map((project) => {
              return (
                <div
                  key={project.id}
                  className="block p-6 h-full text-xl bg-white rounded-xl sm:h-52"
                >
                  <Link href={`/projects/${project.code}`}>
                    <a className="block text-2xl mb-4 text-blue-450 underline decoration-2 underline-offset-4">
                      {project.title}
                    </a>
                  </Link>
                  <div className="flex gap-2.5 mb-1.5">
                    <p className="text-gray-500">Язык:</p>
                    <p>{project.languages.orig_name}</p>
                  </div>
                  <div className="flex gap-2.5 mb-1.5">
                    <p className="text-gray-500">Прогресс:</p>
                    <p>10%</p>
                  </div>
                  <div className="flex gap-3">
                    <p className="text-gray-500">Переводчики:</p>
                    <Translators projectCode={project.code} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
