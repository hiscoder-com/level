import Head from 'next/head'
import LanguagesEdit from '../components/LanguagesEdit'

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
