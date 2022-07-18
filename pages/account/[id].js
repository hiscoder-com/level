import Head from 'next/head'
import Account from '../../components/Account'

function AccountPage() {
  return (
    <div className="container">
      <Head>
        <title>V-CANA Intro {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Account />
    </div>
  )
}

export default AccountPage
