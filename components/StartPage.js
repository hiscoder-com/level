import { useState } from 'react'
import Link from 'next/link'

import SwitchLocalization from './SwitchLocalization'
import Login from './Login'

import { useTranslation } from 'next-i18next'

import VcanaLogo from 'public/vcana-logo-color.svg'
import Instagram from 'public/instagram.svg'
import Telegram from 'public/telegram.svg'
import Youtube from 'public/youtube.svg'
import Facebook from 'public/facebook.svg'
import Close from 'public/close.svg'

const contentObjects = {
  login: <Login />,
  connect: 'connect',
  updates: 'updates',
  partners: 'partners',
  about: <About />,
  reviews: <Reviews />,
  howItWork: <HowItWork />,
  faq: <Faq />,
  demo: 'On the construction',
}
function StartPage({ children }) {
  const { t } = useTranslation('start-page,projects')
  const [contentKey, setContentKey] = useState(null)

  return (
    <main className="flex gap-7 mx-auto max-w-7xl w-full h-[80vh] m-14 text-xl font-bold">
      <aside className="flex flex-col w-1/4 h-full gap-7">
        <div className="flex flex-col justify-between gap-7 h-1/3">
          <div className="flex items-center justify-center p-7 h-2/3 bg-white rounded-2xl">
            <VcanaLogo className="w-44" />
          </div>
          <div className="p-7 flex justify-between items-center h-1/3 bg-th-secondary-10 rounded-2xl z-20">
            <div>{t('projects:Language')}</div>
            <SwitchLocalization />
          </div>
        </div>
        <div className="h-1/3 rounded-2xl bg-[#3C6E71]">
          <div
            className="green-two-layers p-7 h-full w-full text-white z-10 rounded-2xl after:rounded-2xl cursor-pointer"
            onClick={() => setContentKey('updates')}
          >
            {t('Updates')}
          </div>
        </div>
        <div className="h-1/3 rounded-2xl  bg-white">
          <div
            className="gray-two-layers p-7 h-full w-full z-10 rounded-2xl after:rounded-2xl cursor-pointer"
            onClick={() => setContentKey('partners')}
          >
            {t('Partners')}
          </div>
        </div>
      </aside>
      <section className="w-1/2 text-white">
        <div className={`${contentKey ? 'hidden' : 'flex'} h-full gap-7`}>
          <div className="flex flex-col justify-between w-1/2 gap-7">
            <div
              className="p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/about.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              onClick={() => setContentKey('about')}
            >
              {t('WhatIsVcana')}
            </div>
            <div
              className="p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/reviews.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              onClick={() => setContentKey('reviews')}
            >
              {t('Reviews')}
            </div>
          </div>
          <div className="flex flex-col justify-between w-1/2 gap-7">
            <div
              className="p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/inside.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              onClick={() => setContentKey('howItWork')}
            >
              {t('HowItWork')}
            </div>
            <div
              className="p-7 h-1/2 bg-th-secondary-200 rounded-2xl bg-[url('../public/faq.jpg')] bg-cover bg-no-repeat grayscale transform transition duration-300 hover:scale-105 hover:grayscale-0 cursor-pointer"
              onClick={() => setContentKey('faq')}
            >
              FAQ
            </div>
          </div>
        </div>
        <div
          className={`relative p-10 ${
            contentKey ? 'flex' : ' hidden'
          }   h-full gap-7 bg-white rounded-2xl justify-center items-center w-full text-black`}
        >
          {contentObjects[contentKey]}
          <div className="p-2 cursor-pointer" onClick={() => setContentKey(null)}>
            <Close className="absolute w-6 h-6 right-4 top-4 stroke-black" />
          </div>
        </div>
      </section>
      <aside className="flex flex-col justify-between gap-7 w-1/4">
        <div className="flex flex-col justify-between gap-7 h-1/3">
          <div className="h-1/2 rounded-2xl bg-[#3C6E71]">
            <div
              className="green-two-layers p-7 h-full w-full text-white z-10 rounded-2xl cursor-pointer after:rounded-2xl"
              onClick={() => setContentKey('demo')}
            >
              {t('Demo')}
            </div>
          </div>
          <div
            className="p-7 h-1/2 bg-th-secondary-10 rounded-2xl cursor-pointer"
            onClick={() => setContentKey('connect')}
          >
            {t('ConnectWithUs')}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-7 h-2/3">
          <div className="flex justify-center items-center p-7 gap-3 h-[12%] bg-th-secondary-10 rounded-2xl">
            <Social />
          </div>
          <div className="p-7 h-3/4 bg-th-secondary-10 rounded-2xl space-y-4">
            <div className="text-center text-xl space-x-1 uppercase">
              <span>{t('start-page:Verse.Matthew')}</span>
              <span>24:14</span>
            </div>
            <div className="text-base">{t('start-page:Verse.text')}</div>
          </div>
          <div className="h-1/6 rounded-2xl bg-[#3C6E71]">
            <div
              className="p-7 green-two-layers z-10 h-full w-full rounded-2xl after:rounded-2xl text-th-secondary-10 cursor-pointer"
              onClick={() => setContentKey('login')}
            >
              {t('Login')}
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}

export default StartPage

function About() {
  return <div>About</div>
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
        <div className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-th-primary-100">
          <Youtube className="w-4 h-4" />
        </div>
      </Link>
      <Link href="https://texttree.t.me/" target="_blank">
        <div className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-th-primary-100">
          <Telegram className="w-4" />
        </div>
      </Link>
      <Link href="https://facebook.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-th-primary-100">
          <Facebook className="h-4" />
        </div>
      </Link>
      <Link href="https://instagram.com/texttreeorg" target="_blank">
        <div className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-th-primary-100">
          <Instagram />
        </div>
      </Link>
    </>
  )
}
