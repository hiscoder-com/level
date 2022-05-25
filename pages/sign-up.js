import Head from 'next/head'
import SignUp from '../components/SignUp'

export default function SignUpPage() {
  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign up</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignUp />
    </div>
  )
}
