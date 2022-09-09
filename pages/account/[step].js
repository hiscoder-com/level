import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from '/components/Footer'
import Editor from 'components/Editor'

const editableVerses = ['5', '6', '7', '8', '9']
const bd = [
  { id: 0, verse: '4', text: 'noneeditable' },
  {
    id: 1,
    verse: '5',
    text: ' Я оставил тебя на острове Крит для того, чтобы ты завершил незавершённые дела, а также поставил старейшин в собраниях верующих в каждом городе, как я тебе поручил.',
  },
  {
    id: 2,
    verse: '6',
    text: ' Итак, старейшиной должен стать такой человек, который не подаёт повода для осуждения. У него должна быть одна жена, его дети также должны доверять Богу, и люди не должны считать, что его дети неуправляемые или непослушные.',
  },
  { id: 3, verse: '7', text: null },
  { id: 4, verse: '8', text: null },
  { id: 5, verse: '9', text: null },
  { id: 6, verse: '10', text: 'noneeditable' },
]

export default function IntroPage() {
  const { query } = useRouter()
  const { step } = query
  const { t } = useTranslation(['common', 'steps'])
  return (
    <div>
      <Head>
        <title>V-CANA Step {step}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {step === '3' ? (
        <div className="layout-step">
          <div className="layout-step-col lg:w-2/3">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Chapter')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Comments')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Words')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Questions')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Chapter1')}</div>
              <div className="h5 p-4">{t('Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/3 lg:mt-12">
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Audio')}</div>
              <div className="layout-step-col-card-body-audio">
                <p>{t('AudioTitle')}</p>
                <button className="btn-cyan">{t('AudioButton')}</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="layout-step">
          <div className="layout-step-col lg:w-1/2">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Chapter')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Comments')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Words')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Questions')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Chapter1')}</div>
              <div className="h5 p-4">{t('Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/2">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Translation')}</a>
              </button>
              <button>
                <a className="btn-white">{t('MyNotes')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Notes')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Dictionary')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title"></div>
              <div className="h5 p-4">
                <Editor bd={bd} editableVerses={editableVerses} />
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer
        textButton={t('Next')}
        textCheckbox={t('Done')}
        href={`/intro-steps/${String(parseInt(step) + 1)}`}
      />
    </div>
  )
}

export async function getServerSideProps({ locale, params }) {
  if (params.step > 7 || params.step <= 0) {
    return { notFound: true }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'steps'])),
    },
  }
}
