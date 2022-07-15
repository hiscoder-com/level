import Head from 'next/head'
import Link from 'next/link'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import UsersList from '../../components/Users/List'
import { useCurrentUser } from '../../lib/UserContext'

export default function UsersPage() {
  const { t } = useTranslation(['common', 'users'])

  const { session } = useCurrentUser()

  return (
    <>
      <div className="container">
        <Head>
          <title>V-CANA - {t('users_list')}</title>
          <meta name="description" content="VCANA" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <div>{t('users')}</div>
      <UsersList access_token={session?.access_token} />
      <Link href={'/users/create'}>
        <a className="btn btn-filled">{t('create_new_user')}</a>
      </Link>
    </>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'users'])),
    },
  }
}
