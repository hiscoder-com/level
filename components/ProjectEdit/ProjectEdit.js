import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import Parcticipants from './Participants/Participants'

import { supabase } from 'utils/supabaseClient'
import { useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import ResourceSettings from 'components/ProjectEdit/ResourceSettings'
import Brief from './Brief/Brief'

function ProjectEdit() {
  const {
    query: { code },
  } = useRouter()
  const { user } = useCurrentUser()

  const [level, setLevel] = useState('user')

  const [users] = useUsers(user?.access_token)

  const [project] = useProject({ token: user?.access_token, code })

  const highLevelAccess = useMemo(() => ['admin', 'coordinator'].includes(level), [level])

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
    <div className="container flex flex-col gap-7">
      <Parcticipants
        user={user}
        users={users}
        highLevelAccess={highLevelAccess}
        level={level}
      />
      <ResourceSettings />
      <Brief />
    </div>
  )
}

export default ProjectEdit
