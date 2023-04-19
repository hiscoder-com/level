import { useTranslation } from 'next-i18next'
import { useGetBrief } from 'utils/hooks'
import Card from './Card'

function ResumeInfo({ project, user }) {
  const { t } = useTranslation()
  const [brief] = useGetBrief({
    token: user?.access_token,
    project_id: project?.id,
  })

  return (
    <>
      {brief?.is_enable && (
        <Card
          title={`${t('TranslationGoal')} / ${t('Resume')}`}
          link={`${project?.code}/edit#brief`}
        >
          <ul className="pl-5 list-decimal h4-5 xl:max-h-[10vh] overflow-y-scroll">
            {brief?.data_collection?.map(
              (el) => el?.resume && <li key={el.id}>{el?.resume}</li>
            )}
          </ul>
        </Card>
      )}
    </>
  )
}

export default ResumeInfo
