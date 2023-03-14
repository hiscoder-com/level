import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import EditBrief from 'components/EditBrief'

function BriefPageEdit() {
  return <EditBrief />
}

export default BriefPageEdit

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'project-edit', 'users'])),
    },
  }
}
