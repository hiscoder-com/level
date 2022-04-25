import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../utils/supabaseClient'
import SignIn from '../components/SignIn'

export default function SignInPage() {
  const [session, setSession] = useState(null)

  // useEffect(() => {
  //   setSession(supabase.auth.session())

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  // }, [])

  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign in</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? JSON.stringify(supabase.auth.user()) : 'Нет такого юзера!!'}
      <SignIn />
    </div>
  )
}
