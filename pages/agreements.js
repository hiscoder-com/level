import { useRouter } from 'next/router'

import { useCurrentUser } from 'lib/UserContext'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Check from 'public/check.svg'

export default function Agreements() {
  const { t } = useTranslation('users', 'common', 'user-agreement')
  const { push } = useRouter()
  const { user, loading } = useCurrentUser()
  const agreements = [
    {
      name: t('Agreement'),
      link: '/user-agreement',
      done: user?.agreement,
      text: t('user-agreement:TextLicense'),
    },
    {
      name: t('Confession'),
      link: '/confession-steps',
      done: user?.confession,
      text: t('common:DescriptionConfession'),
    },
  ]
  return (
    <div className="layout-appbar">
      <div className="card my-auto bg-th-secondary-10 text-center">
        <div className="mb-7 flex flex-col gap-5 p-6 sm:flex-row sm:px-0 sm:py-1">
          {agreements.map((agreement) => (
            <div
              key={agreement.name}
              className={`relative flex max-w-xs flex-col justify-start gap-5 py-5 pl-3 pr-4 text-start ${
                agreement.done
                  ? 'bg-th-primary-100 text-th-text-secondary-100'
                  : 'bg-th-secondary-200 text-th-text-primary'
              } cursor-pointer rounded-md`}
              onClick={() => push(agreement.link)}
            >
              <div
                className={`absolute right-0 top-0 h-0 w-0 border-[24px] border-solid border-transparent ${
                  agreement.done
                    ? 'border-b-th-primary-400 border-l-th-primary-400'
                    : 'border-b-th-secondary-300 border-l-th-secondary-300'
                } rounded-bl-lg`}
              />
              <div className="absolute right-0 top-0 h-0 w-0 border-[24px] border-solid border-transparent border-r-th-secondary-10 border-t-th-secondary-10" />
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold">{agreement.name}</h1>
                {agreement.done && <Check className="h-5 w-5 stroke-2" />}
              </div>
              <p
                dangerouslySetInnerHTML={{
                  __html: t(agreement.text.split('<br /><br />')[0] ?? '', {
                    interpolation: { escapeValue: false },
                  }),
                }}
                className="mb-2"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => push('/account')}
          disabled={!user?.agreement || !user?.confession}
          className="btn-primary"
        >
          {t('common:Next')}
        </button>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-th-secondary-100'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'users',
        'common',
        'user-agreement',
        'about',
        'start-page',
      ])),
    },
  }
}
