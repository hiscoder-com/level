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
import SectionBlock from './SectionBlock'
import SectionContainer from './SectionContainer'

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

  const [showSections, setShowSections] = useState({
    logo: false,
    updates: false,
    partners: false,
    connect: false,
    signIn: false,
    download: false,
    passwordRecovery: false,
  })

  const [blocks, setBlocks] = useState({
    intro: { clicked: false, opacity: 'opacity-0' },
    howItWork: { clicked: false, opacity: 'opacity-0' },
    reviews: { clicked: false, opacity: 'opacity-0' },
    faq: { clicked: false, opacity: 'opacity-0' },
  })

  useEffect(() => {
    if (defaultContentKey) {
      setShowSections((prev) => ({
        ...prev,
        [defaultContentKey]: true,
      }))
    }
  }, [defaultContentKey])

  const toggleSection = (section) => {
    setShowSections((prev) => {
      const isCurrentlyVisible = prev[section]
      return {
        logo: false,
        updates: false,
        partners: false,
        connect: false,
        signIn: false,
        download: false,
        passwordRecovery: false,
        [section]: !isCurrentlyVisible,
      }
    })
  }

  useEffect(() => {
    if (defaultContentKey) {
      setContentKey(defaultContentKey)
    }
  }, [defaultContentKey])

  useEffect(() => {
    if (defaultContentKey) {
      setBlocks((prev) => ({
        ...prev,
        [defaultContentKey]: {
          clicked: true,
          opacity: 'opacity-100',
        },
      }))
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
    connect: <Feedback t={t} onClose={() => setContentKey(null)} />,
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

  return (
    <>
      <main className="relative mx-auto hidden h-[84vh] max-h-[40rem] w-full max-w-6xl px-5 text-xl font-bold md:flex lg:max-h-[40rem] lg:px-16 xl:max-h-[50rem] xl:px-20 2xl:max-h-[56.4rem] 2xl:px-0">
        <aside className="flex w-1/4 flex-col gap-4 pr-3 xl:gap-7 xl:pr-6">
          <Link
            href={`/${contentRoutes['logo']}`}
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
            {t('ConnectWithUs')}
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
      <main className="relative flex flex-col gap-5 p-5 text-lg font-medium md:hidden">
        <Link href={`/${contentRoutes['logo']}`}>
          <SectionBlock
            sectionKey="logo"
            content={<Logo t={t} />}
            showSection={showSections.logo}
            toggleSection={toggleSection}
            isLogo={true}
            label={<LevelLogo className="h-7" />}
          />
        </Link>
        <div className="grid grid-cols-2 gap-5 text-center">
          {!showSections.signIn && (
            <div className="z-20 flex items-center justify-center rounded-xl bg-th-secondary-10 p-4">
              <SwitchLocalization />
            </div>
          )}
          <Link
            scroll={false}
            href="/"
            shallow
            onClick={async (e) => {
              e.preventDefault()
              await router.push('/')
              router.push(`/${contentRoutes['signIn']}`)
            }}
            className={`cursor-pointer rounded-xl p-5 ${
              showSections.signIn
                ? 'col-span-2 bg-th-secondary-10'
                : 'bg-slate-550 text-th-text-secondary-100'
            }`}
          >
            <p className={`${showSections.signIn ? 'mb-5 font-semibold' : ''}`}>
              {showSections.signIn ? t('users:LoginToAccount') : t('users:SignIn')}
            </p>
            {showSections.signIn && (
              <Login
                handleClick={() => {
                  toggleSection(
                    showSections.signIn && showSections.connect ? 'signIn' : 'connect'
                  )
                }}
              />
            )}
          </Link>
        </div>

        <div
          className={`relative cursor-pointer overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.intro.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('intro')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/main/about-mobile.webp")] bg-cover bg-no-repeat transition-opacity duration-500 ${
              blocks.intro.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.intro.clicked ? (
              <LevelIntro t={t} opacity={blocks.intro.opacity} />
            ) : (
              <p
                className="text-white"
                dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsLevel') }}
              ></p>
            )}
          </div>
        </div>
        <div
          className={`relative cursor-pointer overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.howItWork.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('howItWork')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/main/inside-mobile.webp")] bg-cover bg-no-repeat transition-opacity duration-500 ${
              blocks.howItWork.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.howItWork.clicked ? (
              <HowItWorks t={t} opacity={blocks.howItWork.opacity} />
            ) : (
              <p className="text-white">{t('MainBlocks.HowItWorks')}</p>
            )}
          </div>
        </div>
        <div
          className={`relative cursor-pointer overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.reviews.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('reviews')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/main/reviews-mobile.webp")] bg-cover bg-no-repeat transition-opacity duration-500 ${
              blocks.reviews.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.reviews.clicked ? (
              <Reviews t={t} opacity={blocks.reviews.opacity} />
            ) : (
              <p className="text-white">{t('MainBlocks.Reviews')}</p>
            )}
          </div>
        </div>
        <div
          className={`relative cursor-pointer overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.faq.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('faq')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/main/faq-mobile.webp")] bg-cover bg-no-repeat transition-opacity duration-500 ${
              blocks.faq.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.faq.clicked ? (
              <FrequentlyAskedQuestions t={t} opacity={blocks.faq.opacity} />
            ) : (
              <p className="text-white">{t('FAQ')}</p>
            )}
          </div>
        </div>
        <Link scroll={false} href={`/${contentRoutes['partners']}`}>
          <SectionBlock
            sectionKey="partners"
            label={t('Partners')}
            content={<Partners t={t} />}
            showSection={showSections.partners}
            toggleSection={toggleSection}
          />
        </Link>
        <Link scroll={false} href={`/${contentRoutes['connect']}`}>
          <SectionBlock
            sectionKey="connect"
            label={t('ConnectWithUs')}
            content={<Feedback t={t} onClose={() => toggleSection('feedback')} />}
            showSection={showSections.connect}
            toggleSection={toggleSection}
          />
        </Link>
        <SectionContainer
          showSections={showSections}
          toggleSection={toggleSection}
          setContentKey={setContentKey}
          t={t}
        />

        <div className="absolute bottom-0 left-1/2 z-10 block -translate-x-1/2 md:hidden">
          <CookiesAproove />
        </div>
      </main>
    </>
  )
}

export default StartPage
