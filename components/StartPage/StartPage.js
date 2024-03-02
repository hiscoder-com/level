import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import AboutVersion from 'components/AboutVersion'
import Feedback from './Feedback'
import Logo from './Logo'
import Demo from './Demo'
import Login from './Login'
import Reviews from './Reviews'
import PasswordRecovery from './PasswordRecovery'
import HowItWorks from './HowItWorks'
import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import SwitchLocalization from 'components/SwitchLocalization'
import VcanaIntro from './VcanaIntro'
import Partners from './Partners'
import SectionBlock from './SectionBlock'

import Close from 'public/close.svg'
import VcanaLogo from 'public/vcana-logo-color.svg'

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
    demo: false,
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
    intro: <VcanaIntro t={t} />,
    reviews: <Reviews t={t} />,
    howItWork: <HowItWorks t={t} />,
    faq: <FrequentlyAskedQuestions t={t} />,
    demo: <Demo t={t} />,
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
      <main className="hidden md:flex mx-auto max-w-6xl w-full h-[84vh] max-h-[40rem] lg:max-h-[40rem] xl:max-h-[50rem] 2xl:max-h-[56.4rem] text-xl font-bold px-5 lg:px-16 xl:px-20 2xl:px-0">
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pr-3 xl:pr-6">
          <div
            className="flex flex-grow items-center justify-center p-5 lg:p-7 bg-white rounded-2xl cursor-pointer"
            onClick={() => handleContentClick('logo')}
          >
            <VcanaLogo className="w-44" />
          </div>
          <div className="flex justify-between items-center h-[4.4rem] p-5 lg:p-7 bg-th-secondary-10 rounded-2xl z-20 text-base lg:text-lg">
            <p>{t('projects:Language')}</p>
            <SwitchLocalization />
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-slate-550">
            <p
              className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl cursor-pointer"
              onClick={() => handleContentClick('updates')}
            >
              {t('common:Updates')}
            </p>
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-white">
            <p
              className="gray-two-layers p-5 lg:p-7 h-full w-full z-10 rounded-2xl after:rounded-2xl cursor-pointer"
              onClick={() => handleContentClick('partners')}
            >
              {t('Partners')}
            </p>
          </div>
        </aside>
        <section className="w-1/2 px-1 text-white">
          <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-4 xl:gap-7`}>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <div
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/about.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('intro')}
                dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsVcana') }}
              ></div>

              <div
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('reviews')}
              >
                {t('MainBlocks.Reviews')}
              </div>
            </div>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <div
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('howItWork')}
              >
                {t('MainBlocks.HowItWorks')}
              </div>

              <div
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('faq')}
              >
                {t('MainBlocks.FAQ')}
              </div>
            </div>
          </div>
          <div
            className={`relative text-3xl p-10 ${
              contentKey ? 'flex' : 'hidden'
            } h-full bg-white rounded-2xl w-full overflow-hidden text-black`}
          >
            {contentObjects[contentKey]}
            <Close
              className="absolute w-6 h-6 right-9 top-10 stroke-black cursor-pointer"
              onClick={() => {
                setContentKey(null)
                if (defaultContentKey) {
                  router.replace('/', undefined, { shallow: true })
                }
              }}
            />
          </div>
        </section>
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pl-3 xl:pl-6">
          <div className="h-32 rounded-2xl bg-slate-550">
            <p
              className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl uppercase cursor-pointer after:rounded-2xl"
              onClick={() => handleContentClick('demo')}
            >
              {t('Demo')}
            </p>
          </div>
          <div
            className="p-5 lg:p-7 bg-th-secondary-10 rounded-2xl cursor-pointer h-auto xl:h-32"
            onClick={() => handleContentClick('connect')}
          >
            {t('ConnectWithUs')}
          </div>
          <div className="p-3 lg:p-5 2xl:p-7 flex-grow bg-th-secondary-10 rounded-2xl space-y-2 2xl:space-y-4 overflow-hidden">
            <p className="text-xs 2xl:text-base overflow-auto font-normal">
              {t('Verse.text')}
            </p>
            <p className="text-right text-xs 2xl:text-sm space-x-1 uppercase font-normal">
              {t('Verse.Matthew')}
            </p>
          </div>
          <div className="h-32 rounded-2xl bg-slate-550">
            <p
              className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer"
              onClick={() => handleContentClick('signIn')}
            >
              {t('users:SignIn')}
            </p>
          </div>
        </aside>
      </main>
      <main className="flex md:hidden flex-col gap-5 p-5 font-medium text-lg">
        <SectionBlock
          sectionKey="logo"
          content={<Logo t={t} />}
          showSection={showSections.logo}
          toggleSection={toggleSection}
          isLogo={true}
          label={<VcanaLogo className="h-7" />}
        />

        <div className="grid grid-cols-2 gap-5 text-center">
          {!showSections.updates && (
            <div className="flex justify-center items-center p-4 bg-th-secondary-10 rounded-xl z-20">
              <SwitchLocalization />
            </div>
          )}

          <div
            className={`p-5 bg-th-secondary-10 rounded-xl ${
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
        </div>

        <div
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
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
              <VcanaIntro t={t} opacity={blocks.intro.opacity} />
            ) : (
              <p
                className="text-white"
                dangerouslySetInnerHTML={{ __html: t('MainBlocks.WhatIsVcana') }}
              ></p>
            )}
          </div>
        </div>
        <div
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
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
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
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
              <p className="text-white">{t('Reviews')}</p>
            )}
          </div>
        </div>
        <div
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
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
          {!showSections.signIn && (
            <div
              className={`p-5 bg-th-secondary-10 rounded-xl ${
                showSections.demo ? 'col-span-2' : ''
              }`}
              onClick={() => toggleSection('demo')}
            >
              <p className={`uppercase ${showSections.demo ? 'font-semibold' : ''}`}>
                {t('Demo')}
              </p>
              {showSections.demo && <Demo t={t} />}
            </div>
          )}

          {!showSections.demo && (
            <div
              className={`p-5 rounded-xl ${
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
          )}
        </div>
      </main>
    </>
  )
}

export default StartPage
