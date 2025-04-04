import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import BookReader from 'components/Project/BookReader'

function BookReaderPage() {
  return <BookReader />
}

export default BookReaderPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'books',
        'users',
        'projects',
        'about',
        'start-page',
      ])),
    },
  }
}
