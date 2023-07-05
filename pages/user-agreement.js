import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from 'components/Footer'

import useSupabaseClient from 'utils/supabaseClient'

export default function UserAgreement() {
  const supabase = useSupabaseClient()

  const router = useRouter()
  const { t } = useTranslation(['user-agreement', 'common', 'users'])
  const handleClick = async () => {
    const { error } = await supabase.rpc('check_agreement')
    if (error) {
      console.error(error)
    } else {
      router.push(`/confession`)
    }
  }

  return (
    <div className="layout-appbar">
      <div
        className="text-alignment text-justify overflow-auto text-gray-800"
        style={{ height: 'calc(100vh - 11rem)' }}
      >
        <h1 className="pt-4 text-4xl">{t('users:Agreement')}:</h1>
        <div className="mt-7">
          <b className="font-bold">{t('License')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextLicense', { interpolation: { escapeValue: false } }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Recommendations')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextRecommendation', { interpolation: { escapeValue: false } }),
            }}
            className="py-4"
          />
          <b className="font-bold">{t('Definition')}</b>
          <p
            dangerouslySetInnerHTML={{
              __html: t('TextDefinition', { interpolation: { escapeValue: false } }),
            }}
            className="pt-4"
          />
        </div>
      </div>
      <Footer
        textButton={t('common:Next')}
        textCheckbox={t('users:Agree')}
        handleClick={handleClick}
      />
    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['user-agreement', 'common', 'users'])),
    },
  }
}
