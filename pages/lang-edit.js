import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../utils/supabaseClient'
import LanguagesEdit from '../components/LanguagesEdit'

export default function LanguagesEditPage() {
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
        <title>V-CANA Sign up</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LanguagesEdit />
    </div>
  )
}
