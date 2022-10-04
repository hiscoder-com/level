import Head from 'next/head'

import { useTranslation } from 'next-i18next'

import { useProjects, useUserProjects } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

import ProjectCard from './ProjectCard'

export default function Projects({ languageCode }) {
  const { user } = useCurrentUser()
  const { t } = useTranslation(['projects'])

  const [projects] = useProjects({
    token: user?.access_token,
    language_code: languageCode,
  })

  return (
    <>
      <div className="container">
        <Head>
          <title>{t('V-CANAProjects')}</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="text-3xl mb-5">
          {`${user?.is_admin ? `${t('Projects')}` : `${t('MyProjects')}`}`}:
        </div>
        <div className="grid grid-cols-1 gap-7 my-5 sm:grid-cols-1 md:grid-cols-2 md:my-10 xl:grid-cols-3">
          {projects &&
            projects.map((project) => {
              return <ProjectCard key={project.id} project={project} />
            })}
        </div>
      </div>
    </>
  )
}
