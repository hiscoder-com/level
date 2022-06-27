import Head from 'next/head'
import Link from 'next/link'

import { supabase } from '../../utils/supabaseClient'
import { useProjects } from '../../utils/hooks'
import { useUser } from '../../lib/UserContext'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ProjectsPage() {
  const { user, session } = useUser()

  const [projects, { mutate }] = useProjects(session?.access_token)
  console.log(projects)
  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA Sign up</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <div>Проекты:</div>
      {projects &&
        projects.data.map((project) => {
          return (
            <div key={project.id}>
              {`${project.id} ${project.title} ${project.code}`}{' '}
            </div>
          )
        })}
      <Link href={'/projects/create'}>
        <a className="btn-filled btn">Add New</a>
      </Link>
    </>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
