import Head from 'next/head'
import Link from 'next/link'

import UsersList from 'components/Users/UsersList'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function UsersPage() {
  const { t } = useTranslation(['users', 'common'])

  return (
    <>
      <Head>
        <title>
          {t('common:LEVEL')} - {t('UsersList')}
        </title>
        <meta name="description" content="LEVEL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-7xl pb-10">
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
      ...(await serverSideTranslations(locale, [
        'users',
        'common',
        'about',
        'start-page',
      ])),
    },
  }
}
