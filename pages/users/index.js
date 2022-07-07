import Head from 'next/head'
import { supabase } from '../../utils/supabaseClient'
import { useUsers } from '../../utils/hooks'
import { useUser } from '../../lib/UserContext'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function UsersPage() {
  const { user, session } = useUser()
  const [currentRole, setCurrentRole] = useState('')
  const [canChangeRole, setCanChangeRole] = useState(false)
  const [users, { mutate }] = useUsers(session?.access_token)
  const roles = ['admin', 'translator', 'coordinator', 'moderator']
  useEffect(() => {
    if (!users || !user) {
      return
    }
    const currentUser = users.find((el) => el.users.id === user.id)
    if (currentUser) {
      setCurrentRole(currentUser.role)
    }
  }, [user, users])

  const canAddRole = async (role, toUser) => {
    const { data, error } = await supabase.rpc('can_change_role', role, user.id, toUser)
    console.log({ data })
    return data
  }

  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA Sign up</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <div>
        {user && user.email} {currentRole && currentRole}
      </div>
      <div>Назначение </div>
      <div>
        {users
          ? users.map((user) => {
              return (
                <>
                  <div onClick={() => } key={user.users.id}>
                    {user.users.email} : {user.role} ,{user.users.id}
                  </div>
                  <div className="inline-block"></div>
                </>
              )
            })
          : 'нет юзеров'}
      </div>
    </>
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
