import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function IntroPage() {
  const router = useRouter()
  const { step } = router.query
  const condition = `${step > 3 ? 'btn-white' : 'hidden'}`

  return (
    <div className="">
      <Head>
        <title>V-CANA Step {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto flex flex-col gap-8 max-w-7xl f-screen-appbar items-center lg:items-stretch lg:flex-row">
        <div className="flex flex-col gap-6 w-1/2">
          <div className="space-x-3 self-start">
            <button>
              <a className="btn-cyan">Глава</a>
            </button>
            <button>
              <a className="btn-white">Комментарии</a>
            </button>
            <button>
              <a className="btn-white">Слова</a>
            </button>
            <button>
              <a className={condition}>Вопросы</a>
            </button>
          </div>
          <div className="flex flex-col h-96 bg-white rounded-lg lg:h-full">
            <div className="h4 pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg">
              Глава 1
            </div>
            <div className="h4 p-4">Текст:</div>
          </div>
        </div>
        {/* <div className="flex flex-col gap-6 w-1/2">
          <div className="space-x-3 self-start ">
            <button>
              <a className="btn-cyan">Перевод</a>
            </button>
            <button>
              <a className="btn-white">Мои заметки</a>
            </button>
            <button>
              <a className="btn-white">Заметки</a>
            </button>
            <button>
              <a className="btn-white">Словарь</a>
            </button>
          </div>
          <div className="flex flex-col h-full bg-white rounded-lg">
            <div className="h4 pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg"></div>
            <div className="h4 p-4">Текст:</div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['intro-steps', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
