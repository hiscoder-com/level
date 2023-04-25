import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Brief from 'components/ProjectEdit/Brief/Brief'

function BriefPageEdit() {
  return (
    <div
      className="mx-auto max-w-7xl
    "
    >
      <Brief />
    </div>
  )
}

export default BriefPageEdit

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project-edit', 'users'])),
    },
  }
}
