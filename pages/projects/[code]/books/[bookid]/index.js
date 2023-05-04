import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ChapterList from 'components/Project/ChapterList/ChapterList'

function ChapterListPage() {
  return <ChapterList />
}

export default ChapterListPage

//TODO проверить массив переводов - всё ли используется

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'projects',
        'common',
        'books',
        'chapters',
        'book-properties',
        'users',
      ])),
    },
  }
}
