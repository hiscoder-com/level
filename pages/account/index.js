import Head from 'next/head'

import Account from '../../components/Account'

function AccountHomePage() {
  return (
    <div className="container">
      <Head>
        <title>V-CANA Account</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Account />
    </div>
  )
}

export default AccountHomePage
