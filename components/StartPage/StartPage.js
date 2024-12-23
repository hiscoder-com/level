import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import AboutVersion from 'components/AboutVersion'
import SwitchLocalization from 'components/SwitchLocalization'

import CookiesAproove from './CookiesAproove'
import Download from './Download'
import Feedback from './Feedback'
import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import HowItWorks from './HowItWorks'
import LevelIntro from './LevelIntro'
import Login from './Login'
import Logo from './Logo'
import Partners from './Partners'
import PasswordRecovery from './PasswordRecovery'
import Reviews from './Reviews'

import Close from 'public/icons/close.svg'
import LevelLogo from 'public/icons/level-logo-color.svg'

const contentRoutes = {
  signIn: 'sign-in',
  connect: 'connect-with-us',
  updates: 'updates',
  partners: 'partners',
  intro: 'what-is-level',
  reviews: 'reviews',
  howItWork: 'how-it-works',
  faq: 'faq',
  download: 'download',
  logo: 'about',
}

function StartPage({ defaultContentKey = null }) {
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common'])
  const router = useRouter()
  const [contentKey, setContentKey] = useState(defaultContentKey)

  useEffect(() => {
    if (defaultContentKey) {
      setContentKey(defaultContentKey)
    }
  }, [defaultContentKey])

  const handleContentClick = async (newContentKey) => {
    if (defaultContentKey) {
      await router.replace('/', undefined, { shallow: true, scroll: false })
    }
    if (contentKey === newContentKey) {
      setContentKey(null)
    } else {
      setContentKey(newContentKey)
      handleClick(newContentKey)
    }
  }

  const contentObjects = {
    signIn: <Login handleClick={() => handleContentClick('connect')} />,
    connect: (
      <div className="flex w-full flex-col gap-6 md:gap-0">
        <p className="mb-4 font-semibold md:font-bold">{t('start-page:WriteToUs')}</p>
        <Feedback t={t} onClose={() => setContentKey(null)} />
      </div>
    ),
    updates: <AboutVersion isStartPage={true} />,
    partners: <Partners t={t} />,
    intro: <LevelIntro t={t} />,
    reviews: <Reviews t={t} />,
    howItWork: <HowItWorks t={t} />,
    faq: <FrequentlyAskedQuestions t={t} />,
    download: <Download t={t} />,
    logo: <Logo t={t} />,
    passwordRecovery: <PasswordRecovery contentKey={contentKey} />,
  }
  const handleClick = (contentKey) => {
    if (contentKey && contentRoutes[contentKey]) {
      router.replace(`/${contentRoutes[contentKey]}`, undefined, {
        shallow: true,
        scroll: false,
      })
    }
  }
  const mainLink = router.pathname === '/' ? `/${contentRoutes['logo']}` : '/'
  return (
    <>
      <main className="relative mx-auto hidden h-[84vh] max-h-[40rem] w-full max-w-6xl px-5 text-xl font-bold md:flex lg:max-h-[40rem] lg:px-16 xl:max-h-[50rem] xl:px-20 2xl:max-h-[56.4rem] 2xl:px-0">
        <aside className="flex w-1/4 flex-col gap-4 pr-3 xl:gap-7 xl:pr-6">
          <Link
            href={mainLink}
            className="flex flex-grow cursor-pointer items-center justify-center rounded-2xl bg-white p-5 lg:p-7"
          >
            <LevelLogo className="" />
          </Link>
          <div className="z-20 flex h-[4.4rem] items-center justify-between rounded-2xl bg-th-secondary-10 p-5 text-base lg:p-7 lg:text-lg">
            <p>{t('projects:Language')}</p>
            <SwitchLocalization />
          </div>
          <Link
            href={`/${contentRoutes['updates']}`}
            className="h-[19.4rem] cursor-pointer rounded-2xl bg-slate-550"
          >
            <p className="green-two-layers z-10 h-full w-full rounded-2xl p-5 text-white after:rounded-2xl lg:p-7">
              {t('common:Updates')}
            </p>
          </Link>
          <Link
            href={`/${contentRoutes['partners']}`}
            className="h-[19.4rem] cursor-pointer rounded-2xl bg-white"
          >
            <p className="gray-two-layers z-10 h-full w-full rounded-2xl p-5 after:rounded-2xl lg:p-7">
              {t('Partners')}
            </p>
          </Link>
        </aside>

        <section className="w-1/2 px-1 text-white">
          <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-4 xl:gap-7`}>
            <div className="flex w-1/2 flex-col justify-between gap-4 xl:gap-7">
              <Link
                href={`/${contentRoutes['intro']}`}
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/main/about.webp')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
              >
                {t('MainBlocks.WhatIsLevel')}
              </Link>
              <Link
                href={`/${contentRoutes['reviews']}`}
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/main/reviews.webp')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
              >
                {t('MainBlocks.Reviews')}
              </Link>
            </div>
            <div className="flex w-1/2 flex-col justify-between gap-4 xl:gap-7">
              <Link
                href={`/${contentRoutes['howItWork']}`}
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/main/inside.webp')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
              >
                {t('MainBlocks.HowItWorks')}
              </Link>

              <Link
                href={`/${contentRoutes['faq']}`}
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/main/faq.webp')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
              >
                {t('MainBlocks.FAQ')}
              </Link>
            </div>
          </div>
          <div
            className={`relative p-10 text-3xl ${
              contentKey ? 'flex' : 'hidden'
            } h-full w-full overflow-hidden rounded-2xl bg-white text-black`}
          >
            {contentObjects[contentKey]}
            <Close
              className="absolute right-9 top-10 h-6 w-6 cursor-pointer stroke-black"
              onClick={() => {
                setContentKey(null)
                if (defaultContentKey) {
                  router.replace('/', undefined, { shallow: true })
                }
              }}
            />
          </div>
        </section>

        <aside className="flex w-1/4 flex-col gap-4 pl-3 xl:gap-7 xl:pl-6">
          <Link
            href={`/${contentRoutes['signIn']}`}
            className="h-32 cursor-pointer rounded-2xl bg-slate-550"
          >
            <p className="green-two-layers z-10 h-full w-full rounded-2xl p-5 text-th-secondary-10 after:rounded-2xl lg:p-7">
              {t('users:SignIn')}
            </p>
          </Link>
          <Link
            href={`/${contentRoutes['connect']}`}
            className="h-auto cursor-pointer rounded-2xl bg-th-secondary-10 p-5 lg:p-7 xl:h-32"
          >
            {t('WriteToUs')}
          </Link>
          <div className="flex-grow space-y-2 overflow-hidden rounded-2xl bg-th-secondary-10 p-3 lg:p-5 2xl:space-y-4 2xl:p-7">
            <p className="overflow-auto text-xs font-normal 2xl:text-base">
              {t('Verse.text')}
            </p>
            <p className="space-x-1 text-right text-xs font-normal uppercase 2xl:text-sm">
              {t('Verse.Matthew')}
            </p>
          </div>

          <Link
            href={`/${contentRoutes['download']}`}
            className="h-32 cursor-pointer rounded-2xl bg-slate-550"
          >
            <p className="green-two-layers z-10 h-full w-full rounded-2xl p-5 text-white after:rounded-2xl lg:p-7">
              {t('common:Download')}
            </p>
          </Link>
        </aside>
        <div className="absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 md:block">
          <CookiesAproove />
        </div>
      </main>
    </>
  )
}

export default StartPage
