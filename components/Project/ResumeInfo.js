import { useTranslation } from 'next-i18next'
import { useGetBrief } from 'utils/hooks'
import Card from './Card'

function ResumeInfo({ project, user }) {
  const { t } = useTranslation(['common', 'projects'])
  const [brief] = useGetBrief({
    token: user?.access_token,
    project_id: project?.id,
  })

  return (
    <Card
      title={`${t('TranslationGoal')} / ${t('projects:Resume')}`}
      link={`/projects/${project?.code}/edit?setting=brief`}
      isOpen={false}
      access
    >
      <ul className="pl-6 text-lg list-decimal">
        {brief?.data_collection?.map(
          (el) => el?.resume && <li key={el.id}>{el?.resume}</li>
        )}
      </ul>
    </Card>
  )
}

export default ResumeInfo
