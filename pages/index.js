import Link from 'next/link'
import Head from 'next/head'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import VcanaLogo from '../public/vcana-logo.svg'
import TtLogo from '../public/tt-logo.svg'
import { useUser } from '../lib/UserContext'
import { useCurrentUser, useRedirect } from '../utils/hooks'
import { useEffect, useState } from 'react'
export default function Home() {
  const { user, session } = useUser()
  const { href } = useRedirect({
    user,
    token: session?.access_token,
    startLink: '/login',
  })
  const { locale, pathname, query, asPath } = useRouter()
  const { t } = useTranslation('common')

  return (
    <main className="layout-empty">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="absolute top-10 right-10 font-bold text-xl lg:text-base">
        <Link href={{ pathname, query }} as={asPath} locale={'ru'}>
          <a className={`text-teal-500 p-2 ${locale === 'ru' ? 'opacity-50' : ''}`}>RU</a>
        </Link>
        <Link replace href={{ pathname, query }} as={asPath} locale={'en'}>
          <a className={`text-teal-500 p-2 ${locale === 'en' ? 'opacity-50' : ''}`}>EN</a>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center m-3">
        <TtLogo className="mb-10 w-1/3 md:w-1/5 lg:w-32" />
        <VcanaLogo className="md:w-4/5 lg:w-3/6 xl:w-5/12 2xl:w-1/3" />
        <h2 className="h2 mt-9 mb-16 text-center">{t('Welcome')}</h2>
        <Link href={href}>
          <a className="btn-start py-3 px-24">{t('SignIn')}</a>
        </Link>
      </div>
    </main>
  )
}

Home.layoutType = 'empty'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  }
}
