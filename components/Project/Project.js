import BookList from './BookList/BookList'
import ParticipantInfo from './ParticipantInfo'
import ProjectInfo from './ProjectInfo'
import ResumeInfo from './ResumeInfo'

import { useCurrentUser } from 'lib/UserContext'

import { useAccess, useGetBrief, useProject } from 'utils/hooks'

function Project({ code }) {
  const { user } = useCurrentUser()
  const [project] = useProject({ code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }, { isLoading }] =
    useAccess({
      user_id: user?.id,
      code: project?.code,
    })
  const [brief] = useGetBrief({
    project_id: project?.id,
  })
  return (
    <div className="mx-auto flex max-w-7xl flex-col-reverse gap-7 pb-10 xl:flex-row">
      <div className="static top-7 flex w-full flex-col gap-7 self-start sm:flex-row xl:sticky xl:w-1/3 xl:flex-col">
        <div
          className={`flex w-full flex-col gap-7 xl:w-full xl:flex-col ${
            brief?.is_enable ? 'sm:w-1/2' : 'sm:flex-row'
          }`}
        >
          <ProjectInfo project={project} access={isAdminAccess} />
          <ParticipantInfo project={project} access={isCoordinatorAccess} />
        </div>
        {brief?.is_enable && (
          <div className="w-full sm:w-1/2 xl:w-full">
            <ResumeInfo project={project} />
          </div>
        )}
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
