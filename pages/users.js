import Head from 'next/head'
import { supabase } from '../utils/supabaseClient'
import { useAllUsers } from '../utils/hooks'
import { useUser } from '../lib/UserContext'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'

export default function UsersPage() {
  const { user, session } = useUser()
  const [canChangeRole, setCanChangeRole] = useState(false)
  const [users, { mutate }] = useAllUsers(session?.access_token)
  console.log({ user })

  console.log({ users })
  // const canEditLanguages = async () => {
  //   const { data, error } = await supabase.rpc('authorize', {
  //     requested_permission: 'languages',
  //     user_id: user.id,
  //   })
  //   setEditLanguages(data)
  //   return data
  // }
  // useEffect(() => {
  //   if (user) {
  //     canEditLanguages()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user])

  return (
    <div className="container">
      <Head>
        <title>V-CANA Sign up</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
