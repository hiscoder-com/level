import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import TextColumn from '../../components/TextColumn'
import NoteColumn from '../../components/NoteColumn'

export default function IntroPage() {
  const router = useRouter()
  const { step } = router.query

  return (
    <div className="layout-appbar">
      <Head>
        <title>V-CANA Step {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-row gap-8 w-full ">
        <div className="w-2/3">
          <TextColumn step={step} />
        </div>
        <div className="w-1/3">
          <NoteColumn step={step} />
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['intro-steps', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
