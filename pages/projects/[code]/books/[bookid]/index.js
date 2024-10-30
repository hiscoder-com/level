import ChapterList from 'components/Project/ChapterList/ChapterList'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function ChapterListPage() {
  return <ChapterList />
}

export default ChapterListPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'books',
        'users',
        'about',
        'start-page',
      ])),
    },
  }
}
