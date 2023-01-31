import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslators } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'
import BookList from './BookList'

function Project({ code }) {
  const { t } = useTranslation(['projects', 'common', 'books', 'chapters'])
  const [level, setLevel] = useState('user')
  const [project, setProject] = useState()
  const highLevelAccess = ['admin', 'coordinator'].includes(level)
  const { user } = useCurrentUser()

  useEffect(() => {
    const getProject = async () => {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*,languages!inner(orig_name,code)')
        .eq('code', code)
        .single()
      setProject(project)
    }
    if (code) {
      getProject()
    }
  }, [code])

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setLevel(level.data)
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
                  {el.is_moderator ? '(Moderator)' : ''}
                </div>
              )
            })}
          </>
        )}
      </div>
      <BookList highLevelAccess={highLevelAccess} project={project} user={user} />
    </div>
  )
}

export default Project
