import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from '../components/Footer'
import { useCurrentUser } from '../lib/UserContext'

export default function UserAgreement() {
  const router = useRouter()
  const { t } = useTranslation(['user-agreement', 'common'])
  const { user } = useCurrentUser()
  const handleSetAgreement = async () => {
    if (!user?.id) {
      return
    }
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put('/api/agreements/user', {
        // TODO agreements это свойство юзера, по этому надо просто делать апдейт юзера
        // post('/api/users/${user.id}', {agreements: true})
        user_id: user.id,
      })
      .then((result) => {
        const { status } = result
        if (status === 200) {
          router.push('confession')
        }
      })
      .catch((error) => console.log(error, 'from axios'))
  }

  return (
    <div className="layout-appbar">
      <div className="text-alignment text-justify">
        <h1 className="h1 pt-4">{t('Agreement')}:</h1>
        <div className="h6 mt-7">
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
        textCheckbox={t('common:Agree')}
        handleSetAgreement={handleSetAgreement}
        href="/confession"
      />
    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['user-agreement', 'common'])),
      // Will be passed to the page component as props
    },
  }
}
