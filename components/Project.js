import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

function Project({ code }) {
  const { t } = useTranslation(['projects'])
  const [level, setLevel] = useState('user')

  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, code })

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setLevel(level.data)
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

  const [translators] = useTranslators({
    token: user?.access_token,
    code: code,
  })

  return (
    <div>
      <h3 className="h3">{project?.title}</h3>
      <div className="mt-4">
        {t('Code')} <b>{project?.code}</b>
      </div>
      <div>
        {t('Language')}{' '}
        {project?.languages && (
          <b>{project?.languages?.orig_name + ' (' + project?.languages?.code + ')'}</b>
        )}
      </div>

      <div className="mt-4">
        {translators && Object.keys(translators).length > 0 && (
          <>
            {t('Translators')}:
            {translators.map((el, key) => {
              return (
                <div className="font-bold" key={key}>
                  {`${el.users.login} ${el.users.email}`}
                  {el.is_moderator ? '(Moderator)' : ''}
                </div>
              )
            })}
          </>
        )}
        {['admin', 'coordinator'].includes(level) && (
          <div className="mt-4">
            <Link href={`/projects/${project?.code}/edit`}>
              <a className="btn btn-filled btn-cyan">{t('ProjectEditing')}</a>
            </Link>
            <br />
            <Link href={`/projects/${project?.code}/books`}>
              <a className="btn btn-filled btn-cyan mt-3">{t('ProjectBooks')}</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Project
