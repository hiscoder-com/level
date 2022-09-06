import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from '/components/Footer'
import Workspace from 'components/Workspace'
import { steps, reference } from '@/utils/bd'

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
        <Workspace config={steps[step - 1].workspace} reference={reference} />
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
