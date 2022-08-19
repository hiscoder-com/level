import Link from 'next/link'

import Translators from './Translators'

function ProjectCard({ project }) {
  return (
    <div className="block p-6 h-full text-xl bg-white rounded-xl sm:h-52">
      <Link href={`/projects/${project.code}`}>
        <a className="block text-2xl mb-4 text-blue-450 underline decoration-2 underline-offset-4">
          {project.title}
        </a>
      </Link>
      <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">Язык:</p>
        <p>{project.languages.orig_name}</p>
      </div>
      <div className="flex gap-2.5 mb-1.5">
        <p className="text-gray-500">Прогресс:</p>
        <p>10%</p>
      </div>
      <div className="flex gap-3">
        <p className="text-gray-500">Переводчики:</p>
        <Translators projectCode={project.code} />
      </div>
    </div>
  )
}

export default ProjectCard
