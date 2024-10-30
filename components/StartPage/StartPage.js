import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import AboutVersion from 'components/AboutVersion'
import SwitchLocalization from 'components/SwitchLocalization'
import { useTranslation } from 'next-i18next'
import Close from 'public/close.svg'
import LevelLogo from 'public/level-logo-color.svg'

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

function StartPage({ defaultContentKey = null }) {
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common'])
  const router = useRouter()
  const [contentKey, setContentKey] = useState(defaultContentKey)

  const [showSections, setShowSections] = useState({
    logo: false,
    updates: false,
    partners: false,
    feedback: false,
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

  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  useEffect(() => {
    if (defaultContentKey) {
      setContentKey(defaultContentKey)
    }
  }, [defaultContentKey])

  const handleContentClick = (newContentKey) => {
    if (contentKey === newContentKey) {
      setContentKey(null)
    } else {
      setContentKey(newContentKey)
    }
    if (defaultContentKey) {
      router.replace('/', undefined, { shallow: true })
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

  const toggleBlock = (key) => {
    setBlocks((prev) => ({
      ...prev,
      [key]: {
        clicked: !prev[key].clicked,
        opacity: prev[key].clicked ? 'opacity-0' : 'opacity-100',
      },
    }))
  }

  return (
    <>
      <main className="relative mx-auto hidden h-[84vh] max-h-[40rem] w-full max-w-6xl px-5 text-xl font-bold md:flex lg:max-h-[40rem] lg:px-16 xl:max-h-[50rem] xl:px-20 2xl:max-h-[56.4rem] 2xl:px-0">
        <aside className="flex w-1/4 flex-col gap-4 pr-3 xl:gap-7 xl:pr-6">
          <div
            className="flex flex-grow cursor-pointer items-center justify-center rounded-2xl bg-white p-5 lg:p-7"
            onClick={() => handleContentClick('logo')}
          >
            <LevelLogo className="" />
          </div>
          <div className="z-20 flex h-[4.4rem] items-center justify-between rounded-2xl bg-th-secondary-10 p-5 text-base lg:p-7 lg:text-lg">
            <p>{t('projects:Language')}</p>
            <SwitchLocalization />
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-slate-550">
            <p
              className="green-two-layers z-10 h-full w-full cursor-pointer rounded-2xl p-5 text-white after:rounded-2xl lg:p-7"
              onClick={() => handleContentClick('updates')}
            >
              {t('common:Updates')}
            </p>
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-white">
            <p
              className="gray-two-layers z-10 h-full w-full cursor-pointer rounded-2xl p-5 after:rounded-2xl lg:p-7"
              onClick={() => handleContentClick('partners')}
            >
              {t('Partners')}
            </p>
          </div>
        </aside>
        <section className="w-1/2 px-1 text-white">
          <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-4 xl:gap-7`}>
            <div className="flex w-1/2 flex-col justify-between gap-4 xl:gap-7">
              <div
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/about.jpg')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
                onClick={() => setContentKey('intro')}
                dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsLevel') }}
              ></div>

              <div
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
                onClick={() => setContentKey('reviews')}
              >
                {t('MainBlocks.Reviews')}
              </div>
            </div>
            <div className="flex w-1/2 flex-col justify-between gap-4 xl:gap-7">
              <div
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
                onClick={() => setContentKey('howItWork')}
              >
                {t('MainBlocks.HowItWorks')}
              </div>

              <div
                className="h-1/2 transform cursor-pointer rounded-2xl bg-th-secondary-200 bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat p-5 grayscale transition duration-300 hover:scale-105 hover:grayscale-0 lg:p-7"
                onClick={() => setContentKey('faq')}
              >
                {t('MainBlocks.FAQ')}
              </div>
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
          <div className="h-32 rounded-2xl bg-slate-550">
            <p
              className="green-two-layers z-10 h-full w-full cursor-pointer rounded-2xl p-5 text-th-secondary-10 after:rounded-2xl lg:p-7"
              onClick={() => handleContentClick('signIn')}
            >
              {t('users:SignIn')}
            </p>
          </div>
          <div
            className="h-auto cursor-pointer rounded-2xl bg-th-secondary-10 p-5 lg:p-7 xl:h-32"
            onClick={() => handleContentClick('connect')}
          >
            {t('ConnectWithUs')}
          </div>
          <div className="flex-grow space-y-2 overflow-hidden rounded-2xl bg-th-secondary-10 p-3 lg:p-5 2xl:space-y-4 2xl:p-7">
            <p className="overflow-auto text-xs font-normal 2xl:text-base">
              {t('Verse.text')}
            </p>
            <p className="space-x-1 text-right text-xs font-normal uppercase 2xl:text-sm">
              {t('Verse.Matthew')}
            </p>
          </div>

          <div className="h-32 cursor-pointer rounded-2xl bg-slate-550">
            <p
              className="green-two-layers aftercursor-pointer z-10 h-full w-full rounded-2xl p-5 text-white after:rounded-2xl lg:p-7"
              onClick={() => handleContentClick('download')}
            >
              {t('common:Download')}
            </p>
          </div>
        </aside>
        <div className="absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 md:block">
          <CookiesAproove />
        </div>
      </main>
      <main className="relative flex flex-col gap-5 p-5 text-lg font-medium md:hidden">
        <SectionBlock
          sectionKey="logo"
          content={<Logo t={t} />}
          showSection={showSections.logo}
          toggleSection={toggleSection}
          isLogo={true}
          label={<LevelLogo className="h-7" />}
        />
        <div className="grid grid-cols-2 gap-5 text-center">
          {!showSections.signIn && (
            <div className="z-20 flex items-center justify-center rounded-xl bg-th-secondary-10 p-4">
              <SwitchLocalization />
            </div>
          )}
          <div
            className={`rounded-xl p-5 ${
              showSections.signIn
                ? 'col-span-2 bg-th-secondary-10'
                : 'bg-slate-550 text-th-text-secondary-100'
            }`}
            onClick={() => toggleSection('signIn')}
          >
            <p className={`${showSections.signIn ? 'mb-5 font-semibold' : ''}`}>
              {showSections.signIn ? t('users:LoginToAccount') : t('users:SignIn')}
            </p>
            {showSections.signIn && (
              <Login
                handleClick={() => {
                  toggleSection(
                    showSections.signIn && showSections.feedback ? 'signIn' : 'feedback'
                  )
                }}
              />
            )}
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.intro.clicked ? '' : 'h-36'
          }`}
          onClick={() => toggleBlock('intro')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/about-mobile.jpg")] bg-cover bg-no-repeat transition-opacity duration-500 ${
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
          className={`relative overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.howItWork.clicked ? '' : 'h-36'
          }`}
          onClick={() => toggleBlock('howItWork')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/inside-mobile.jpg")] bg-cover bg-no-repeat transition-opacity duration-500 ${
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
          className={`relative overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.reviews.clicked ? '' : 'h-36'
          }`}
          onClick={() => toggleBlock('reviews')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/reviews-mobile.jpg")] bg-cover bg-no-repeat transition-opacity duration-500 ${
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
          className={`relative overflow-hidden rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 ${
            blocks.faq.clicked ? '' : 'h-36'
          }`}
          onClick={() => toggleBlock('faq')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/faq-mobile.jpg")] bg-cover bg-no-repeat transition-opacity duration-500 ${
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

        <SectionBlock
          sectionKey="partners"
          label={t('Partners')}
          content={<Partners t={t} />}
          showSection={showSections.partners}
          toggleSection={toggleSection}
        />
        <SectionBlock
          sectionKey="feedback"
          label={t('ConnectWithUs')}
          content={<Feedback t={t} onClose={() => toggleSection('feedback')} />}
          showSection={showSections.feedback}
          toggleSection={toggleSection}
        />
        <div className="grid grid-cols-2 gap-5 text-center">
          {!showSections.updates && (
            <div
              className={`rounded-xl bg-th-secondary-10 p-5 ${
                showSections.download ? 'col-span-2' : ''
              }`}
              onClick={() => toggleSection('download')}
            >
              <p className={`mb-9 ${showSections.download ? 'font-semibold' : ''}`}>
                {t('common:Download')}
              </p>
              {showSections.download && <Download t={t} />}
            </div>
          )}

          {!showSections.download && (
            <div
              className={`rounded-xl bg-th-secondary-10 p-5 ${
                showSections.updates ? 'col-span-2' : ''
              }`}
              onClick={() => toggleSection('updates')}
            >
              {!showSections.updates ? (
                <p>{t('Updates')}</p>
              ) : (
                <AboutVersion isStartPage={true} />
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-1/2 z-10 block -translate-x-1/2 md:hidden">
          <CookiesAproove />
        </div>
      </main>
    </>
  )
}

export default StartPage
