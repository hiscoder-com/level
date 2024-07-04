import Head from 'next/head'
import { useRouter } from 'next/router'

import axios from 'axios'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import { useUser } from 'utils/hooks'

export default function UserPage() {
  const { t } = useTranslation(['users', 'common'])

  const router = useRouter()
  const { id } = router.query
  const [user] = useUser(id)

  const handleBlock = (blocked) => {
    axios
      .post('/api/users/' + user?.id, { blocked })
      .then((res) => {
        console.log('success', res)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }
  return (
    <>
      <Head>
        <title>
          {t('V-CANA')} - {t('profile')}
        </title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {router.isFallback ? (
        <div></div>
      ) : (
        <div className="mx-auto max-w-7xl">
          <h1>{t('UserPage')}</h1>
          <div>
            {t('Login')}: {user?.login}
          </div>
          <div>
            {t('Email')}: {user?.email}
          </div>
          <div>
            {t('Agreement')}: {user?.agreement ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('Confession')}: {user?.confession ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('IsAdmin')}: {user?.is_admin ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            {t('Blocked')}: {user?.blocked ? t('common:Yes') : t('common:No')}
          </div>
          <div>
            <div onClick={() => handleBlock(!user?.blocked)}>
              {user?.blocked ? t('Unblock') : t('Block')}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['users', 'common'])),
    },
  }
}

// Если у нас динамический роутинг, то для серверсайд рендеринга нужно указать все варианты страниц
// например тут можно было бы получить список всех юзеров и в path поместить массив url. Тогда он сделает рендер ввиде html и json для быстрого отображения.
// еще мы указали fallback в true. По этому если пререндера нет то можем показать колесико загрузки
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}
