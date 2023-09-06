import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ChapterList from 'components/Project/ChapterList/ChapterList'

function ChapterListPage() {
  return <ChapterList />
}

export default ChapterListPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'books', 'users'])),
    },
  }
}
