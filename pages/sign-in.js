import Head from 'next/head'
import { useUser } from '../lib/UserContext'
import SignIn from '../components/SignIn'

export default function SignInPage() {
  const { user, session } = useUser()
  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign in</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? JSON.stringify(user) : 'Нет такого юзера!!'}
      <SignIn />
    </div>
  )
}
