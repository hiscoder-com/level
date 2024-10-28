import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Link from 'next/link'

// Импортируем компоненты и SVG для отображения разных частей страницы
import AboutVersion from 'components/AboutVersion'
import Feedback from './Feedback'
import Logo from './Logo'
import Download from './Download'
import Login from './Login'
import Reviews from './Reviews'
import PasswordRecovery from './PasswordRecovery'
// import HowItWorks from './HowItWorks'
import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import SwitchLocalization from 'components/SwitchLocalization'
import LevelIntro from './LevelIntro'
import Partners from './Partners'
import SectionBlock from './SectionBlock'

import Close from 'public/close.svg'
import LevelLogo from 'public/level-logo-color.svg'
import CookiesAproove from './CookiesAproove'
import SectionContainer from './SectionContainer'

// Компонент StartPage
function StartPage({ defaultContentKey = null }) {
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common']) // Подключаем перевод текста
  const router = useRouter() // Подключаем роутинг для навигации
  const [contentKey, setContentKey] = useState(defaultContentKey) // Хранение текущего контента

  // Объект состояния, показывающий, какие секции открыты
  const [showSections, setShowSections] = useState({
    logo: false,
    updates: false,
    partners: false,
    connect: false,
    signIn: false,
    download: false,
    passwordRecovery: false,
  })

  // Объект для управления состоянием блоков, таких как intro, faq и т.д.
  const [blocks, setBlocks] = useState({
    intro: { clicked: false, opacity: 'opacity-0' },
    howItWork: { clicked: false, opacity: 'opacity-0' },
    reviews: { clicked: false, opacity: 'opacity-0' },
    faq: { clicked: false, opacity: 'opacity-0' },
  })

  // Хук эффекта: если есть defaultContentKey, то включаем соответствующий раздел
  useEffect(() => {
    if (defaultContentKey) {
      setShowSections((prev) => ({
        ...prev,
        [defaultContentKey]: true,
      }))
    }
  }, [defaultContentKey])

  // Переключение видимости разделов
  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Если defaultContentKey задан, обновляем contentKey
  useEffect(() => {
    if (defaultContentKey) {
      setContentKey(defaultContentKey)
    }
  }, [defaultContentKey])

  // Обновляем блоки в зависимости от defaultContentKey
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

  // Обработка кликов на элементы контента
  const handleContentClick = (newContentKey) => {
    console.log(newContentKey, 92)
    if (contentKey === newContentKey) {
      setContentKey(null) // Закрываем, если уже выбран
    } else {
      setContentKey(newContentKey) // Открываем, если не выбран
      handleClick(newContentKey)
    }
    if (defaultContentKey) {
      router.replace('/', undefined, { shallow: true })
    }
  }

  // Объекты контента для рендеринга при выборе контентного ключа
  const contentObjects = {
    signIn: <Login handleClick={() => handleContentClick('connect')} />,
    connect: <Feedback t={t} onClose={() => setContentKey(null)} />,
    updates: <AboutVersion isStartPage={true} />,
    partners: <Partners t={t} />,
    intro: <LevelIntro t={t} />,
    reviews: <Reviews t={t} />,
    howItWork: <Reviews t={t} />, // <HowItWorks t={t} />, используется Reviews в качестве примера
    faq: <FrequentlyAskedQuestions t={t} />,
    download: <Download t={t} />,
    logo: <Logo t={t} />,
    passwordRecovery: <PasswordRecovery contentKey={contentKey} />,
  }

  // Сопоставление контентного ключа с маршрутом для навигации
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

  // Обработчик клика на контентный ключ для перехода по маршрутам
  const handleClick = (contentKey) => {
    if (contentKey && contentRoutes[contentKey]) {
      router.push(`/${contentRoutes[contentKey]}`)
    }
  }

  return (
    <>
      {/* Главный контейнер с основным содержимым */}
      <main className="hidden relative md:flex mx-auto max-w-6xl w-full h-[84vh] max-h-[40rem] lg:max-h-[40rem] xl:max-h-[50rem] 2xl:max-h-[56.4rem] text-xl font-bold px-5 lg:px-16 xl:px-20 2xl:px-0">
        {/* Левый сайдбар с логотипом, локализацией и другими элементами */}
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pr-3 xl:pr-6">
          <Link
            href={`/${contentRoutes['logo']}`}
            className="flex flex-grow items-center justify-center p-5 lg:p-7 bg-white rounded-2xl cursor-pointer"
          >
            <LevelLogo className="" />
          </Link>
          <div className="flex justify-between items-center h-[4.4rem] p-5 lg:p-7 bg-th-secondary-10 rounded-2xl z-20 text-base lg:text-lg">
            <p>{t('projects:Language')}</p>
            <SwitchLocalization />
          </div>
          <Link
            href={`/${contentRoutes['updates']}`}
            className="h-[19.4rem] rounded-2xl bg-slate-550 cursor-pointer"
          >
            <p className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl">
              {t('common:Updates')}
            </p>
          </Link>
          <Link
            href={`/${contentRoutes['partners']}`}
            className="h-[19.4rem] rounded-2xl bg-white cursor-pointer"
          >
            <p className="gray-two-layers p-5 lg:p-7 h-full w-full z-10 rounded-2xl after:rounded-2xl">
              {t('Partners')}
            </p>
          </Link>
        </aside>

        {/* Секция с центральным контентом */}
        <section className="w-1/2 px-1 text-white">
          <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-4 xl:gap-7`}>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <Link
                href={`/${contentRoutes['intro']}`}
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/about.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              >
                {t('MainBlocks.WhatIsLevel')}
              </Link>
              <Link
                href={`/${contentRoutes['reviews']}`}
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              >
                {t('MainBlocks.Reviews')}
              </Link>
            </div>
            <div className="flex flex-col justify-between w-1/2 gap-4 xl:gap-7">
              <Link
                href={`/${contentRoutes['howItWork']}`}
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              >
                {t('MainBlocks.HowItWorks')}
              </Link>

              <Link
                href={`/${contentRoutes['faq']}`}
                className="p-5 lg:p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              >
                {t('MainBlocks.FAQ')}
              </Link>
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

        {/* Правый сайдбар */}
        <aside className="flex flex-col w-1/4 gap-4 xl:gap-7 pl-3 xl:pl-6">
          <Link
            href={`/${contentRoutes['signIn']}`}
            className="h-32 rounded-2xl bg-slate-550 cursor-pointer"
          >
            <p className="p-5 lg:p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10">
              {t('users:SignIn')}
            </p>
          </Link>
          <Link
            href={`/${contentRoutes['connect']}`}
            className="p-5 lg:p-7 bg-th-secondary-10 rounded-2xl cursor-pointer h-auto xl:h-32"
          >
            {t('ConnectWithUs')}
          </Link>
          <div className="p-3 lg:p-5 2xl:p-7 flex-grow bg-th-secondary-10 rounded-2xl space-y-2 2xl:space-y-4 overflow-hidden">
            <p className="text-xs 2xl:text-base overflow-auto font-normal">
              {t('Verse.text')}
            </p>
            <p className="text-right text-xs 2xl:text-sm space-x-1 uppercase font-normal">
              {t('Verse.Matthew')}
            </p>
          </div>

          <Link
            href={`/${contentRoutes['download']}`}
            className="h-32 rounded-2xl bg-slate-550 cursor-pointer"
          >
            <p className="green-two-layers p-5 lg:p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl">
              {t('common:Download')}
            </p>
          </Link>
        </aside>
        <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2  z-10">
          <CookiesAproove />
        </div>
      </main>
      <main className="relative flex md:hidden flex-col gap-5 p-5 font-medium text-lg">
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
            <div className="flex justify-center items-center p-4 bg-th-secondary-10 rounded-xl z-20">
              <SwitchLocalization />
            </div>
          )}
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
                    showSections.signIn && showSections.connect ? 'signIn' : 'connect'
                  )
                }}
              />
            )}
          </div>
        </div>

        <div
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
            blocks.intro.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('intro')}
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
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
            blocks.howItWork.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('howItWork')}
        >
          <div
            className={`absolute inset-0 bg-[url("../public/inside-mobile.jpg")] bg-cover bg-no-repeat transition-opacity duration-500 ${
              blocks.howItWork.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>
          <div className="relative z-10">
            {blocks.howItWork.clicked ? (
              <Reviews t={t} opacity={blocks.howItWork.opacity} /> //HowItWorks
            ) : (
              <p className="text-white">{t('MainBlocks.HowItWorks')}</p>
            )}
          </div>
        </div>
        <div
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
            blocks.reviews.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('reviews')}
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
          className={`relative rounded-2xl bg-th-secondary-10 p-5 transition-all duration-500 overflow-hidden ${
            blocks.faq.clicked ? '' : 'h-36'
          }`}
          onClick={() => handleContentClick('faq')}
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
          sectionKey="connect"
          label={t('ConnectWithUs')}
          content={<Feedback t={t} onClose={() => toggleSection('feedback')} />}
          showSection={showSections.connect}
          toggleSection={toggleSection}
        />
        <SectionContainer
          showSections={showSections}
          toggleSection={toggleSection}
          setContentKey={setContentKey}
          t={t}
        />

        <div className="md:hidden block absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
          <CookiesAproove />
        </div>
      </main>
    </>
  )
}

export default StartPage
