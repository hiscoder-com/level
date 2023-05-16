import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'

function CoordinatorsList({ coordinators, setSelectedCoordinator, access }) {
  const { t } = useTranslation(['common', 'users'])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:text-lg">
        <div className="w-1/3">{t('users:Login')}</div>
        <div className="hidden md:block w-full md:w-2/6">{t('users:Email')}</div>
        <div className="w-1/3 md:w-1/6"></div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {coordinators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center">
            <div className="flex gap-2 items-center w-1/3 truncate">
              <div className="w-8 h-8">
                <TranslatorImage item={el} />
              </div>
              <div>{el.users.login}</div>
            </div>
            <div className="hidden md:block md:w-2/6">{el.users.email}</div>
            <div className="w-1/3 md:w-1/6"></div>
            <div className="flex justify-end w-1/3 md:w-1/6">
              {access && (
                <button
                  onClick={() => setSelectedCoordinator(el.users)}
                  className="btn-red md:text-xl"
                >
                  {t('Remove')}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default CoordinatorsList
