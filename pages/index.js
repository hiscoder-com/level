import Head from 'next/head'

export default function Home() {
  return (
    <div className="container mx-auto relative px-3 font-sans min-h-screen flex flex-col justify-center">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex absolute top-10 right-10  font-bold justify-end text-xl lg:text-base">
        <a className="text-teal-500 p-2" href="#">
          RU
        </a>
        <a className="text-teal-500 opacity-50 p-2" href="#">
          EN
        </a>
      </div>
      <div className="flex flex-col items-center m-3 justify-center">
        <img className="h-9 mb-10" src="/TT_Logo.svg" alt="logo TT" />
        <img className="h-28" src="/VCANA_logo.svg" alt="logo VCANA" />

        <div className="mt-9 mb-16 text-2xl text-center text-slate-600">
          Вход на данный сайт только по приглашению админов ресурса.
        </div>
        <div className="btn">ВХОД</div>
      </div>
    </div>
  )
}

Home.emptyLayout = true
