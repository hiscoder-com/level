import ProjectInfo from './ProjectInfo'
import ParticipantInfo from './ParticipantInfo'
import ResumeInfo from './ResumeInfo'
import BookList from './BookList/BookList'

import { useCurrentUser } from 'lib/UserContext'
import { useAccess, useProject } from 'utils/hooks'

function Project({ code }) {
  const { user } = useCurrentUser()
  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }, { isLoading }] =
    useAccess({
      token: user?.access_token,
      user_id: user?.id,
      code: project?.code,
    })
  return (
    <div className="flex flex-col-reverse xl:flex-row gap-7 mx-auto max-w-7xl pb-10">
      <div className="static xl:sticky top-7 flex flex-col sm:flex-row xl:flex-col gap-7 w-full xl:w-1/3 self-start">
        <div className="flex flex-col gap-7 w-full sm:w-1/2 xl:w-full">
          <ProjectInfo project={project} access={isCoordinatorAccess} />
          <ParticipantInfo project={project} user={user} access={isModeratorAccess} />
        </div>
        <div className="w-full sm:w-1/2 xl:w-full">
          <ResumeInfo project={project} user={user} />
        </div>
      </div>
      <div className="w-full xl:w-2/3">
        <BookList
          user={user}
          project={project}
          access={{ isCoordinatorAccess, isModeratorAccess, isAdminAccess, isLoading }}
        />
      </div>
    </div>
  )
}

export default Project
