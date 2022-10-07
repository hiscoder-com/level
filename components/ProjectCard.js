import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Translators from './Translators'
import { useCurrentUser } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

function ProjectCard({ project }) {
  const { t } = useTranslation(['projects', 'common'])

  const { user } = useCurrentUser()

  const [level, setLevel] = useState('user')

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

  return (
    <div className="block p-6 h-full bg-white rounded-xl sm:h-52">
      <Link href={`/projects/${project.code}`}>
        <a className="block text-2xl mb-4 text-blue-450 underline decoration-2 underline-offset-4">
          {project.title}
        </a>
      </Link>
      <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">{t('Language')}:</p>
        <p>{project.languages.orig_name}</p>
      </div>
      <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">{t('common:Progress')}:</p>
        <p>10%</p>
      </div>
      <div className="flex gap-3">
        <p className="text-gray-500">{t('Translators')}:</p>
        <Translators projectCode={project.code} size="25px" />
        {['translator', 'moderator'].includes(level) && (
          <div className="btn">Continue translate</div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
