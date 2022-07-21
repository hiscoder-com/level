import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import Footer from '/components/Footer'

export default function IntroPage() {
  const { t } = useTranslation(['steps', 'common'])
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
                <a className="btn-cyan">{t('Cana.Chapter')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Comments')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Words')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Questions')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Cana.Chapter 1')}</div>
              <div className="h5 p-4">{t('Cana.Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/3 lg:mt-12">
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Cana.Audio')}</div>
              <div className="layout-step-col-card-body-audio">
                <p>{t('Cana.Audio title')}</p>
                <button className="btn-cyan">{t('Cana.Audio button')}</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="layout-step">
          <div className="layout-step-col lg:w-1/2">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Cana.Chapter')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Comments')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Words')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Questions')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title">{t('Cana.Chapter 1')}</div>
              <div className="h5 p-4">{t('Cana.Text')}:</div>
            </div>
          </div>
          <div className="layout-step-col lg:w-1/2">
            <div className="space-x-3 text-xs">
              <button>
                <a className="btn-cyan">{t('Cana.Translation')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.My notes')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Notes')}</a>
              </button>
              <button>
                <a className="btn-white">{t('Cana.Dictionary')}</a>
              </button>
            </div>
            <div className="layout-step-col-card">
              <div className="layout-step-col-card-title"></div>
              <div className="h5 p-4">{t('Cana.Text')}:</div>
            </div>
          </div>
        </div>
      )}
      <Footer
        textButton={t('Next', { ns: 'common' })}
        textCheckbox={t('Made', { ns: 'common' })}
        href={`/intro-steps/${String(parseInt(step) + 1)}`}
      />
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['steps', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
