import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import Footer from '/components/Footer'

export default function IntroPage() {
  const { t } = useTranslation(['common', 'steps'])
  const router = useRouter()
  const { step } = router.query

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
              <div className="layout-step-col-card-title">{t('Chapter 1')}</div>
              <div className="h5 p-4">{t('Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/3 lg:mt-12">
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Audio')}</div>
              <div className="layout-step-col-card-body-audio">
                <p>{t('Audio title')}</p>
                <button className="btn-cyan">{t('Audio button')}</button>
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
              <div className="layout-step-col-card-title">{t('Chapter 1')}</div>
              <div className="h5 p-4">{t('Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/2">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Translation')}</a>
              </button>
              <button>
                <a className="btn-white">{t('My notes')}</a>
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
              <div className="h5 p-4">{t('Text')}:</div>
            </div>
          </div>
        </div>
      )}
      <Footer
        textButton={t('Next')}
        textCheckbox={t('Made')}
        href={`/intro-steps/${String(parseInt(step) + 1)}`}
      />
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'steps'])),
      // Will be passed to the page component as props
    },
  }
}
