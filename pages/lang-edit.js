import Head from 'next/head'
import LanguagesEdit from '../components/LanguagesEdit'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function LanguagesEditPage() {
  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign up</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LanguagesEdit />
    </div>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
