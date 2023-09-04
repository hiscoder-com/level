import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useSetRecoilState } from 'recoil'

import { isSwitchingPageState } from 'components/state/atoms'

export default function Agreements() {
  const { t } = useTranslation('users', 'common')
  const { push } = useRouter()
  const setSwitchingPage = useSetRecoilState(isSwitchingPageState)

  function pushWithLoading(link) {
    setSwitchingPage(true)
    setTimeout(() => {
      push(link)
    }, 500)
  }

  return (
    <div className="layout-appbar">
      <div className="flex flex-col text-center space-y-2.5">
        <button
          onClick={() => pushWithLoading('/user-agreement')}
          className="btn-white w-64"
        >
          {t('Agreement')}
        </button>
        <button onClick={() => pushWithLoading('/confession')} className="btn-white w-64">
          {t('Confession')}
        </button>
        <button
          onClick={() => pushWithLoading('/user-agreement')}
          className="btn-cyan w-64"
        >
          {t('common:Next')}
        </button>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-white'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}
