import { useTranslation } from 'next-i18next'

import Card from './Card'

function ProjectInfo({ project, access }) {
  const { t } = useTranslation(['projects', 'common'])
  const info = [
    { label: 'OrigTitle', value: project?.orig_title },
    { label: 'ProjectCode', value: project?.code },
    { label: 'Language', value: project?.languages?.orig_name },
  ]
  return (
    <Card
      title={t('Information')}
      link={`${project?.code}/edit?setting=resources`}
      access={access}
    >
      {project && (
        <div className="flex flex-col gap-4">
          <h4 className="text-xl font-bold">{project?.title}</h4>
          {info.map((infoItem) => (
            <div
              key={infoItem.label}
              className="flex gap-2 text-sm lg:text-lg text-slate-900"
            >
              <p className="w-1/2">
                {t(infoItem.label)}
                {':'}
              </p>
              <p className="w-1/2 text-gray-400">{t(infoItem.value)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default ProjectInfo
