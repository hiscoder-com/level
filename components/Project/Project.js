import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

import BookList from './BookList'
import ProjectInfo from './ProjectInfo'
import ParticipantInfo from './ParticipantInfo'
import ResumeInfo from './ResumeInfo'
import BookListNew from './BookListNew'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common'])

  const [highLevelAccess, setHighLevelAccess] = useState(false)

  const { user } = useCurrentUser()
  const [project] = useProject({ token: user?.access_token, code })
  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user?.id,
        project_id: project.id,
      })
      if (level?.data) {
        setHighLevelAccess(['admin', 'coordinator'].includes(level.data))
      }
    }
    if (user?.id && project?.id) {
      getLevel()
    }
  }, [user?.id, project?.id])

  const [translators] = useTranslators({
    token: user?.access_token,
    code: code,
  })
  // return (
  //   <div className="mx-auto max-w-7xl">
  //     <h3 className="h3 inline-block">{project?.title}</h3>
  //     {highLevelAccess && (
  //       <div className="mt-4 ml-4 inline-block">
  //         <Link href={`/projects/${project?.code}/edit`}>
  //           <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
  //         </Link>
  //       </div>
  //     )}
  //     <div className="mt-4">
  //       {t('Code')} <b>{project?.code}</b>
  //     </div>
  //     <div>
  //       {t('Language')}{' '}
  //       {project?.languages && (
  //         <b>{project?.languages?.orig_name + ' (' + project?.languages?.code + ')'}</b>
  //       )}
  //     </div>
  //     <div className="my-4">
  //       {translators && Object.keys(translators).length > 0 && (
  //         <>
  //           {t('Translators')}:
  //           {translators.map((el, key) => {
  //             return (
  //               <div className="font-bold" key={key}>
  //                 {`${el.users.login} ${el.users.email}`}
  //                 {el.is_moderator ? `(${t('common:Moderator')})` : ''}
  //               </div>
  //             )
  //           })}
  //         </>
  //       )}
  //     </div>
  //     {project && (
  //       <BookList highLevelAccess={highLevelAccess} project={project} user={user} />
  //     )}
  //   </div>
  // )
  return (
    <div className="container flex flex-col-reverse xl:flex-row gap-7">
      <div className="flex flex-row xl:flex-col gap-7 xl:w-1/3">
        <div className="flex flex-col gap-7 w-1/2 xl:w-full">
          <ProjectInfo project={project} />
          <ParticipantInfo project={project} user={user} />
        </div>
        <div className="flex w-1/2 xl:h-full xl:w-full">
          <ResumeInfo project={project} user={user} />
        </div>
      </div>
      <div className="xl:w-2/3">
        <BookListNew />
      </div>
    </div>
  )
}

export default Project
