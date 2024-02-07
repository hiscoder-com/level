import { useEffect, useState } from 'react'
import Link from 'next/link'

import SwitchLocalization from './SwitchLocalization'
import Login from './Login'
import Feedback from './Feedback'
import AboutVersion from './AboutVersion'

import { useTranslation } from 'next-i18next'

import VcanaLogo from 'public/vcana-logo-color.svg'
import UnfoldingWord from 'public/unfolding-word.svg'
import Instagram from 'public/instagram.svg'
import Telegram from 'public/telegram.svg'
import Youtube from 'public/youtube.svg'
import Facebook from 'public/facebook.svg'
import Close from 'public/close.svg'

function StartPage({ children }) {
  const { t } = useTranslation(['start-page', 'projects', 'users'])
  const [contentKey, setContentKey] = useState(null)
  const [showSections, setShowSections] = useState({
    updates: false,
    partners: false,
    feedback: false,
  })

  const [paddingClass, setPaddingClass] = useState('2xl:px-0')

  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const contentObjects = {
    login: <Login />,
    connect: <Feedback t={t} />,
    updates: (
      <AboutVersion
        isStartPage={true}
        setShowUpdates={(value) => toggleSection('updates', value)}
      />
    ),
    partners: <Partners t={t} />,
    about: <About />,
    reviews: <Reviews />,
    howItWork: <HowItWork />,
    faq: <Faq />,
    demo: 'On the construction',
  }

  const [blocks, setBlocks] = useState({
    about: { clicked: false, opacity: 'opacity-0' },
    howItWork: { clicked: false, opacity: 'opacity-0' },
    reviews: { clicked: false, opacity: 'opacity-0' },
    faq: { clicked: false, opacity: 'opacity-0' },
  })

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
        className={`hidden md:flex mx-auto max-w-7xl w-full h-[94vh] max-h-[40rem] lg:max-h-[46rem] xl:max-h-[54rem] 2xl:max-h-[56.4rem] text-xl font-bold px-5 lg:px-16 xl:px-20 ${paddingClass}`}
      >
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pr-3 xl:pr-6">
          <div className="flex flex-grow items-center justify-center p-5 lg:p-7 bg-white rounded-2xl">
            <VcanaLogo className="w-44" />
          </div>
          <div className="p-5 lg:p-7 flex justify-between items-center h-[4.4rem] bg-th-secondary-10 rounded-2xl z-20 text-base lg:text-xl">
            <div>{t('projects:Language')}</div>
            <SwitchLocalization />
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-[#3C6E71]">
            <div
              className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl cursor-pointer"
              onClick={() => setContentKey('updates')}
            >
              {t('Updates')}
            </div>
          </div>
          <div className="h-[19.4rem] rounded-2xl bg-white">
            <div
              className="gray-two-layers p-5 lg:p-7 h-full w-full z-10 rounded-2xl after:rounded-2xl cursor-pointer"
              onClick={() => setContentKey('partners')}
            >
              {t('Partners')}
            </div>
          </div>
        </aside>
        <section className="w-1/2 px-1 text-white">
          <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-4 xl:gap-7`}>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/about.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('about')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-95 group-hover:bg-black/0 transition duration-300"></div>
                <div className="relative z-10">{t('mainBlocks.WhatIsVcana')}</div>
              </div>

              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('reviews')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-95 group-hover:bg-black/0 transition duration-300"></div>
                <div className="relative z-10">{t('mainBlocks.Reviews')}</div>
              </div>
            </div>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('howItWork')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-95 group-hover:bg-black/0 transition duration-300"></div>
                <div className="relative z-10">{t('mainBlocks.HowItWork')}</div>
              </div>

              <div
                className="relative group p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
                onClick={() => setContentKey('faq')}
              >
                <div className="absolute inset-0 rounded-2xl bg-black/10 backdrop-brightness-95 group-hover:bg-black/0 transition duration-300"></div>
                <div className="relative z-10">{t('mainBlocks.FAQ')}</div>
              </div>
            </div>
          </div>
          <div
            className={`relative p-10 ${
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
          <div className="h-32 rounded-2xl bg-[#3C6E71]">
            <div
              className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl uppercase cursor-pointer after:rounded-2xl"
              onClick={() => setContentKey('demo')}
            >
              {t('Demo')}
            </div>
          </div>
          <div
            className="p-5 lg:p-7 h-32 bg-th-secondary-10 rounded-2xl cursor-pointer"
            onClick={() => setContentKey('connect')}
          >
            {t('ConnectWithUs')}
          </div>
          <div className="flex justify-center items-center p-4 gap-3 h-[4.4rem] bg-th-secondary-10 rounded-2xl overflow-x-auto">
            <Social />
          </div>
          <div className="p-5 lg:p-7 flex-grow bg-th-secondary-10 rounded-2xl space-y-2 xl:space-y-4 overflow-hidden">
            <div className="text-center text-lg xl:text-xl space-x-1 uppercase">
              {t('Verse.Matthew')}
            </div>
            <div className="text-xs lg:text-base overflow-auto font-normal">
              {t('Verse.text')}
            </div>
          </div>
          <div className="h-20 lg:h-24 rounded-2xl bg-[#3C6E71]">
            <div
              className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer"
              onClick={() => setContentKey('login')}
            >
              {t('users:SignIn')}
            </div>
          </div>
        </aside>
      </main>
      <main className="flex md:hidden flex-col gap-5 p-5 font-bold text-lg">
        <div className="grid grid-cols-2 gap-5 text-center">
          <div className="flex justify-center p-6 bg-th-secondary-10 rounded-xl">
            <VcanaLogo />
          </div>
          <div className="p-4 bg-th-secondary-10 rounded-xl">
            <SwitchLocalization />
          </div>
        </div>
        <div
          className="px-6 bg-th-secondary-10 rounded-xl text-center"
          onClick={() => toggleSection('updates')}
        >
          {showSections.updates ? (
            <div onClick={(e) => e.stopPropagation()}>
              <AboutVersion
                isStartPage={true}
                setShowUpdates={(value) => toggleSection('updates', value)}
              />
            </div>
          ) : (
            <div className="py-6">{t('Updates')}</div>
          )}
        </div>
        <div
          className={`rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden relative ${
            blocks.about.clicked ? 'min-h-36' : 'h-36'
          }`}
          onClick={() => toggleBlock('about')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/about.jpg")] bg-cover bg-no-repeat bg-center-bottom-1 transition-opacity duration-500 ${
              blocks.about.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.about.clicked ? (
              <>
                <p>{t('mainBlocks.WhatIsVcana')}</p>
                <p
                  className={`text-sm mt-3 transition-opacity duration-700 ${blocks.about.opacity}`}
                >
                  {t('mainBlocks.VcanaText')}
                </p>
              </>
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
            className={`absolute inset-0 bg-[url("../public/inside.jpg")] bg-cover bg-no-repeat bg-center-bottom-2 transition-opacity duration-500 ${
              blocks.howItWork.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.howItWork.clicked ? (
              <>
                <p>{t('mainBlocks.HowItWork')}</p>
                <p
                  className={`text-sm mt-3 transition-opacity duration-700 ${blocks.howItWork.opacity}`}
                >
                  {t('mainBlocks.HowItWorkText')}
                </p>
              </>
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
            className={`absolute inset-0 bg-[url("../public/reviews.jpg")] bg-cover bg-no-repeat bg-center-bottom-2 transition-opacity duration-500 ${
              blocks.reviews.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.reviews.clicked ? (
              <>
                <p>{t('Reviews')}</p>
                <p
                  className={`text-sm mt-3 transition-opacity duration-700 ${blocks.reviews.opacity}`}
                >
                  Some Reviews...
                </p>
              </>
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
            className={`absolute inset-0 bg-[url("../public/faq.jpg")] bg-cover bg-no-repeat bg-center-bottom-3 transition-opacity duration-500 ${
              blocks.faq.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.faq.clicked ? (
              <>
                <p>{t('FAQ')}</p>
                <p
                  className={`text-sm mt-3 transition-opacity duration-700 ${blocks.faq.opacity}`}
                >
                  Some FAQ...
                </p>
              </>
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
            <div>
              <Partners
                t={t}
                setShowPartner={(value) => toggleSection('partners', value)}
              />
            </div>
          ) : (
            <div className="py-6">{t('Partners')}</div>
          )}
        </div>
        <div
          className="p-6 bg-th-secondary-10 rounded-xl"
          onClick={() => toggleSection('feedback')}
        >
          <div className="mb-5 text-center">Связаться с нами</div>
          {showSections.feedback && <Feedback t={t} />}
          <div className="flex justify-center items-center gap-3">
            <Social />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 text-center">
          <div className="p-6 bg-th-secondary-10 rounded-xl text-center">DEMO</div>
          <div className="p-6 text-th-text-secondary-100 bg-th-primary-100 rounded-xl">
            Войти
          </div>
        </div>
      </main>
    </>
  )
}

export default StartPage

function About() {
  return <div>About</div>
}
function Partners({ t }) {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-14">
      <div> {t('Partners')}</div>
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
function Reviews() {
  return <div>Reviews</div>
}
function HowItWork() {
  return <div>HowItWork</div>
}
function Faq() {
  return <div>FAQ</div>
}

function Social() {
  return (
    <>
      <Link href="https://youtube.com/@texttree" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-th-primary-100">
          <Youtube className="w-4 h-4" />
        </div>
      </Link>
      <Link href="https://texttree.t.me/" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-th-primary-100">
          <Telegram className="w-4" />
        </div>
      </Link>
      <Link href="https://facebook.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-th-primary-100">
          <Facebook className="h-4" />
        </div>
      </Link>
      <Link href="https://instagram.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-6 lg:w-7 h-6 lg:h-7 p-0 lg:p-2 rounded-full bg-th-primary-100">
          <Instagram />
        </div>
      </Link>
    </>
  )
}
