import { useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import { useGetBrief } from 'utils/hooks'
import Card from './Card'
import { getBriefName } from 'utils/helper'

function ResumeInfo({ project }) {
  const { t } = useTranslation(['common', 'projects'])
  const [brief] = useGetBrief({
    project_id: project?.id,
  })

  const titleBrief = useMemo(() => {
    return getBriefName(brief?.name, `${t('TranslationGoal')} / ${t('projects:Resume')}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief?.name])

  return (
    <Card
      title={titleBrief}
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
