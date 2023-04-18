import { useTranslation } from 'next-i18next'

import Card from './Card'

function ProjectInfo({ project }) {
  const { t } = useTranslation()
  return (
    <Card title={t('Information')} link={`${project?.code}/edit`}>
      {project && (
        <div className="flex flex-col gap-4">
          <h4 className="h4 font-bold">{project?.title}</h4>
          {[
            { label: 'OrigTitle', value: project?.orig_title },
            { label: 'ProjectCode', value: project?.code },
            { label: 'Language', value: project?.languages?.orig_name },
          ].map((projectItem) => (
            <div key={projectItem.label} className="flex gap-2 text-sm h4-5 lg:text-lg">
              <p className="w-1/2">
                {t(projectItem.label)}
                {':'}
              </p>
              <p className="w-1/2 text-teal-500">{t(projectItem.value)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default ProjectInfo
