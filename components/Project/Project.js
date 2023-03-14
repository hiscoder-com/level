import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

import BookList from './BookList'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common'])

  const [highLevelAccess, setHighLevelAccess] = useState(false)
  const [project, setProject] = useState()

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

  return (
    <div className="mx-auto max-w-7xl">
      <h3 className="h3 inline-block">{project?.title}</h3>
      {highLevelAccess && (
        <div className="mt-4 ml-4 inline-block">
          <Link href={`/projects/${project?.code}/edit`}>
            <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
          </Link>
        </div>
      )}
      <div className="mt-4">
        {t('Code')} <b>{project?.code}</b>
      </div>
      <div>
        {t('Language')}{' '}
        {project?.languages && (
          <b>{project?.languages?.orig_name + ' (' + project?.languages?.code + ')'}</b>
        )}
      </div>
      <div className="my-4">
        {translators && Object.keys(translators).length > 0 && (
          <>
            {t('Translators')}:
            {translators.map((el, key) => {
              return (
                <div className="font-bold" key={key}>
                  {`${el.users.login} ${el.users.email}`}
                  {el.is_moderator ? `(${t('common:Moderator')})` : ''}
                </div>
              )
            })}
          </>
        )}
      </div>
      {project && (
        <BookList highLevelAccess={highLevelAccess} project={project} user={user} />
      )}
    </div>
  )
}

export default Project
