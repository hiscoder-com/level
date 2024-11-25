import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import CommunityAudio from 'components/CommunityAudio/CommunityAudio'

function CommunityAudioPage({ bookid, code }) {
  return <CommunityAudio code={code} bookid={bookid} />
}

export default CommunityAudioPage

export async function getServerSideProps({ locale, query }) {
  const { bookid, code } = query
  return {
    props: {
      bookid,
      code,
      ...(await serverSideTranslations(locale, [
        'common',
        'books',
        'users',
        'about',
        'start-page',
        'audio',
      ])),
    },
  }
}
