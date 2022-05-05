import Head from 'next/head'
import Image from 'next/image'
export default function Home() {
  return (
    <div className="container pt-24 px-40 font-sans">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        <div className="flex space-x-3 text-sm font-bold pb-40 justify-end">
          <div>
            <a className="text-teal-500 " href="#">
              RU
            </a>
          </div>
          <div>
            <a className="text-teal-500/50" href="#">
              EN
            </a>
          </div>
        </div>
        <div>
          <div>
            <img className="h-9 mb-10" src="/TT_Logo.svg" alt="logo TT" />
            <img className="h-28" src="/VCANA_logo.svg" alt="logo VCANA" />

            <div className="pt-9 pb-16 text-2xl leading-7 text-zinc-750">
              {/* <div className="h-9 w-9">
                <Image
                  src="/TT_Logo.svg"
                  alt="Landscape picture"
                  width={500}
                  height={500}
                />
              </div> */}
              <span>Вход на данный сайт только по приглашению админов ресурса.</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="btn">ВХОД</div>
        </div>
      </div>
    </div>
  )
}

Home.emptyLayout = true
