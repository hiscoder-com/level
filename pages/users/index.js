import Head from 'next/head'
import Link from 'next/link'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import UsersList from 'components/Users/UsersList'

export default function UsersPage() {
  const { t } = useTranslation(['users', 'common'])

  return (
    <>
      <Head>
        <title>
          {t('common:V-CANA')} - {t('UsersList')}
        </title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-7xl">
        <div>{t('Users')}</div>
        <UsersList />
        <Link href={'/users/create'} className="btn-primary">
          {t('CreateNewUser')}
        </Link>
      </div>
    </>
  )
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}
