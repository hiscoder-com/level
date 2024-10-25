import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import CommunityAudio from 'components/CommunityAudio/ComunityAudio'
import { useRouter } from 'next/router'

function CommunityAudioPage() {
  const router = useRouter()

  return <CommunityAudio code={router.query.code} bookid={router.query.bookid} />
}

export default CommunityAudioPage

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
