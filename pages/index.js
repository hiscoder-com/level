/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import TT_Logo from '../public/TT_Logo.svg'
import VCANA_logo from '../public/VCANA_logo.svg'

export default function Home() {
  return (
    <div className="container-center mx-auto relative px-3 min-h-screen flex-col ">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex absolute top-10 right-10  font-bold justify-end text-xl lg:text-base disabled:opacity-50">
        <a className="text-teal-500 p-2" href="#">
          RU
        </a>
        <a className="text-teal-500 opacity-50 p-2" href="#">
          EN
        </a>
      </div>
      <div className="flex flex-col items-center m-3 justify-center">
        <TT_Logo className="mb-10 w-1/3 md:w-1/5 lg:w-32 xl:w-32" />
        <VCANA_logo className="md:w-4/5 lg:w-3/6 xl:w-5/12 2xl:w-1/3" />

        <div className="mt-9 mb-16 text-2xl text-center text-slate-600">
          Вход на данный сайт только по приглашению админов ресурса.
        </div>
        <div className="btn">ВХОД</div>
      </div>
    </div>
  )
}

Home.emptyLayout = true
