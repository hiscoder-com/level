import ProjectCard from './ProjectCard'
import ProjectPersonalCard from './ProjectPersonalCard'

import { useProjects } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

export default function Projects({ type }) {
  const { user } = useCurrentUser()
  const [projects] = useProjects()

  let CurrentCard
  let className
  switch (type) {
    case 'projects':
      CurrentCard = ProjectCard
      className =
        'grid grid-cols-1 gap-3 py-5 auto-rows-fr md:grid-cols-2 xl:grid-cols-3 sm:gap-7 md:py-5'
      break
    case 'account':
      CurrentCard = ProjectPersonalCard
      className = 'flex flex-col gap-3 py-5 sm:gap-7'
      break
    default:
      break
  }
  return (
    <>
      <div className={className}>
        {projects &&
          projects.map(
            (project) =>
              project && <CurrentCard key={project.id} project={project} user={user} />
          )}
      </div>
    </>
  )
}
