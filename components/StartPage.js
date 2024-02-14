import { useEffect, useState } from 'react'

import Link from 'next/link'

import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import AboutVersion from './AboutVersion'
import Feedback from './Feedback'
import Demo from './Demo'
import Login from './Login'
import Reviews from './Reviews'
import HowItWork from './HowItWork'
import SwitchLocalization from './SwitchLocalization'

import { useTranslation } from 'next-i18next'

import Close from 'public/close.svg'
import Facebook from 'public/facebook.svg'
import Instagram from 'public/instagram.svg'
import Telegram from 'public/telegram.svg'
import UnfoldingWord from 'public/unfolding-word.svg'
import VcanaLogo from 'public/vcana-logo-color.svg'
import Youtube from 'public/youtube.svg'

function StartPage() {
  const { t } = useTranslation(['start-page', 'projects', 'users'])
  const [contentKey, setContentKey] = useState(null)
  const [paddingClass, setPaddingClass] = useState('2xl:px-0')
  const [showSections, setShowSections] = useState({
    updates: false,
    partners: false,
    feedback: false,
    signIn: false,
    demo: false,
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

  const handleContentClick = (newContentKey) => {
    if (contentKey === newContentKey) {
      setContentKey(null)
    } else {
      setContentKey(newContentKey)
    }
  }

  const contentObjects = {
    signIn: <Login handleClick={() => handleContentClick('connect')} />,
    connect: <Feedback t={t} onClose={() => setContentKey(null)} />,
    updates: (
      <AboutVersion
        isStartPage={true}
        setShowUpdates={(value) => toggleSection('updates', value)}
      />
    ),
    partners: <Partners t={t} />,
    intro: <VcanaIntro t={t} />,
    reviews: <Reviews t={t} />,
    howItWork: <HowItWork t={t} />,
    faq: <FrequentlyAskedQuestions t={t} />,
    demo: <Demo t={t} />,
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

  useEffect(() => {
    const updatePadding = () => {
      const windowHeight = window.innerHeight
      if (windowHeight < 1024 && window.innerWidth >= 1536) {
        setPaddingClass('2xl:px-32')
      } else {
        setPaddingClass('2xl:px-0')
      }
    }

    updatePadding()

    window.addEventListener('resize', updatePadding)

    return () => window.removeEventListener('resize', updatePadding)
  }, [])

  return (
    <>
      <main
        className={`hidden md:flex mx-auto max-w-7xl w-full h-[94vh] max-h-[40rem] lg:max-h-[46rem] xl:max-h-[54rem] 2xl:max-h-[56.4rem] text-2xl font-bold px-5 lg:px-16 xl:px-20 ${paddingClass}`}
      >
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pr-3 xl:pr-6">
          <div className="flex flex-grow items-center justify-center p-5 lg:p-7 bg-white rounded-2xl">
            <VcanaLogo className="w-44" />
          </div>
          <div className="p-5 lg:p-7 flex justify-between items-center h-[4.4rem] bg-th-secondary-10 rounded-2xl z-20 text-base lg:text-lg">
            <p>{t('projects:Language')}</p>
            <SwitchLocalization />
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-slate-550">
            <p
              className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl cursor-pointer"
              onClick={() => handleContentClick('updates')}
            >
              {t('Updates')}
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
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/about.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('intro')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-90 group-hover:bg-black/0 transition duration-300"></div>
                <p className="relative z-10">{t('mainBlocks.WhatIsVcana')}</p>
              </div>

              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('reviews')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-90 group-hover:bg-black/0 transition duration-300"></div>
                <p className="relative z-10">{t('mainBlocks.Reviews')}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('howItWork')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-90 group-hover:bg-black/0 transition duration-300"></div>
                <p className="relative z-10">{t('mainBlocks.HowItWork')}</p>
              </div>

              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('faq')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-90 group-hover:bg-black/0 transition duration-300"></div>
                <p className="relative z-10">{t('mainBlocks.FAQ')}</p>
              </div>
            </div>
          </div>
          <div
            className={`relative text-3xl p-10 ${
              contentKey ? 'flex' : 'hidden'
            } h-full bg-white rounded-2xl w-full text-black`}
          >
            {contentObjects[contentKey]}
            <Close
              className="absolute w-6 h-6 right-9 top-10 stroke-black cursor-pointer"
              onClick={() => setContentKey(null)}
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
          <p
            className="p-5 lg:p-7 h-32 bg-th-secondary-10 rounded-2xl cursor-pointer"
            onClick={() => handleContentClick('connect')}
          >
            {t('ConnectWithUs')}
          </p>
          <div className="flex justify-center items-center p-4 gap-3 h-[4.4rem] bg-th-secondary-10 rounded-2xl overflow-x-auto">
            <Social />
          </div>
          <div className="p-5 lg:p-7 flex-grow bg-th-secondary-10 rounded-2xl space-y-2 xl:space-y-4 overflow-hidden">
            <p className="text-center text-lg xl:text-xl space-x-1 uppercase">
              {t('Verse.Matthew')}
            </p>
            <p className="text-xs lg:text-base overflow-auto font-normal">
              {t('Verse.text')}
            </p>
          </div>
          <div className="h-20 lg:h-24 rounded-2xl bg-slate-550">
            <p
              className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer"
              onClick={() => handleContentClick('signIn')}
            >
              {t('users:SignIn')}
            </p>
          </div>
        </aside>
      </main>
      <main className="flex md:hidden flex-col gap-5 p-5 font-bold text-lg">
        <div className="grid grid-cols-2 gap-5 text-center">
          <div className="flex justify-center p-6 bg-th-secondary-10 rounded-xl">
            <VcanaLogo />
          </div>
          <div className="flex justify-center items-center p-4 bg-th-secondary-10 rounded-xl">
            <SwitchLocalization />
          </div>
        </div>
        <div
          className="px-6 bg-th-secondary-10 rounded-xl text-center"
          onClick={() => toggleSection('updates')}
        >
          {showSections.updates ? (
            <div>
              <AboutVersion
                isStartPage={true}
                setShowUpdates={(value) => toggleSection('updates', value)}
              />
            </div>
          ) : (
            <p className="py-6">{t('Updates')}</p>
          )}
        </div>
        <div
          className={`rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden relative ${
            blocks.intro.clicked ? 'min-h-36' : 'h-36'
          }`}
          onClick={() => toggleBlock('intro')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/about.jpg")] bg-cover bg-no-repeat bg-center-bottom-1 transition-opacity brightness-90 duration-500 ${
              blocks.intro.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.intro.clicked ? (
              <VcanaIntro t={t} opacity={blocks.intro.opacity} />
            ) : (
              <p className="text-white">{t('mainBlocks.WhatIsVcana')}</p>
            )}
          </div>
        </div>
        <div
          className={`rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden relative ${
            blocks.howItWork.clicked ? 'min-h-36' : 'h-36'
          }`}
          onClick={() => toggleBlock('howItWork')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/inside.jpg")] bg-cover bg-no-repeat bg-center-bottom-2 transition-opacity brightness-90 duration-500 ${
              blocks.howItWork.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.howItWork.clicked ? (
              <HowItWork t={t} opacity={blocks.howItWork.opacity} />
            ) : (
              <p className="text-white">{t('mainBlocks.HowItWork')}</p>
            )}
          </div>
        </div>
        <div
          className={`rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden relative ${
            blocks.reviews.clicked ? 'min-h-36' : 'h-36'
          }`}
          onClick={() => toggleBlock('reviews')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/reviews.jpg")] bg-cover bg-no-repeat bg-center-bottom-2 transition-opacity brightness-90 duration-500 ${
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
          className={`rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden relative ${
            blocks.faq.clicked ? 'min-h-36' : 'h-36'
          }`}
          onClick={() => toggleBlock('faq')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/faq.jpg")] bg-cover bg-no-repeat bg-center-bottom-3 transition-opacity brightness-90 duration-500 ${
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
        <div
          className="p-6 bg-th-secondary-10 rounded-xl text-center"
          onClick={() => toggleSection('partners')}
        >
          {showSections.partners ? (
            <Partners t={t} />
          ) : (
            <p className="py-6">{t('Partners')}</p>
          )}
        </div>
        <div
          className="p-6 bg-th-secondary-10 rounded-xl"
          onClick={() => toggleSection('feedback')}
        >
          <div className="mb-5 text-center">{t('ConnectWithUs')}</div>
          {showSections.feedback && <Feedback t={t} />}
          <div className="flex justify-center items-center gap-3">
            <Social />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 text-center">
          {!showSections.signIn && (
            <div
              className={`p-6 bg-th-secondary-10 rounded-xl ${
                showSections.demo ? 'col-span-2' : ''
              }`}
              onClick={() => toggleSection('demo')}
            >
              <div className="uppercase">{t('Demo')}</div>
              {showSections.demo && <Demo t={t} />}
            </div>
          )}

          {!showSections.demo && (
            <div
              className={`p-6 rounded-xl ${
                showSections.signIn
                  ? 'col-span-2 bg-th-secondary-10'
                  : 'bg-slate-550 text-th-text-secondary-100'
              }`}
              onClick={() => toggleSection('signIn')}
            >
              <div className={`${showSections.signIn ? 'mb-5' : ''}`}>
                {showSections.signIn ? t('users:LoginToAccount') : t('users:SignIn')}
              </div>
              {showSections.signIn && (
                <Login
                  handleClick={() => {
                    toggleSection('signIn')
                    toggleSection('feedback')
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

function VcanaIntro({ t, opacity }) {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-12">
      <p>{t('mainBlocks.WhatIsVcana')}</p>
      <div className="flex flex-grow flex-col justify-between items-center pb-6 md:pb-0">
        <p
          className={`text-sm md:text-base font-normal mt-3 transition-opacity duration-700 ${
            opacity || ''
          }`}
        >
          {t('mainBlocks.VcanaText')}
        </p>
        <img src="/v-cana-intro.png" alt="v-cana intro image" className="w-full h-auto" />
      </div>
    </div>
  )
}
function Partners({ t }) {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-14">
      <p>{t('Partners')}</p>
      <div
        className="flex justify-center items-center w-full h-32 md:h-56 rounded-xl bg-th-secondary-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="https://www.unfoldingword.org/" target="_blank">
          <UnfoldingWord />
        </Link>
      </div>
    </div>
  )
}

function Social() {
  return (
    <>
      <Link href="https://youtube.com/@texttree" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-slate-550">
          <Youtube className="w-4 h-4" />
        </div>
      </Link>
      <Link href="https://texttree.t.me/" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-slate-550">
          <Telegram className="w-4" />
        </div>
      </Link>
      <Link href="https://facebook.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-slate-550">
          <Facebook className="h-4" />
        </div>
      </Link>
      <Link href="https://instagram.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-slate-550">
          <Instagram />
        </div>
      </Link>
    </>
  )
}
