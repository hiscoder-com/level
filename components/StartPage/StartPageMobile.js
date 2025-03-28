import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from 'components/SwitchLocalization'

import CookiesAproove from './CookiesAproove'
import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import HowItWorks from './HowItWorks'
import LevelIntro from './LevelIntro'
import Login from './Login'
import OneSection from './OneSection'
import Reviews from './Reviews'
import SectionContainer from './SectionContainer'

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

function StartPageMobile({ defaultContentKey = null }) {
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

  const handleClick = (contentKey) => {
    if (contentKey && contentRoutes[contentKey]) {
      router.replace(`/${contentRoutes[contentKey]}`, undefined, {
        shallow: true,
        scroll: false,
      })
    }
  }
  return (
    <main className="relative flex flex-col gap-5 p-5 text-lg font-medium md:hidden">
      <OneSection
        showSections={showSections}
        label={t('logo')}
        logo={<LevelLogo className="h-7" />}
        toggleSection={toggleSection}
        t={t}
      />
      <div className="grid grid-cols-2 gap-5 text-center">
        {!showSections.signIn && (
          <div className="z-20 flex items-center justify-center rounded-xl bg-th-secondary-10 p-4">
            <SwitchLocalization />
          </div>
        )}
        <div
          scroll={false}
          onClick={async (e) => {
            e.preventDefault()
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
              handleClick={(e) => {
                toggleSection(
                  showSections.signIn && showSections.connect ? 'signIn' : 'connect'
                )
              }}
            />
          )}
        </div>
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
      <OneSection
        showSections={showSections}
        label={t('Partners')}
        toggleSection={toggleSection}
        t={t}
      />
      <OneSection
        showSections={showSections}
        label={t('WriteToUs')}
        toggleSection={toggleSection}
        t={t}
      />
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
  )
}

export default StartPageMobile
