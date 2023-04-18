import { useTranslation } from 'next-i18next'
import { Switch } from '@headlessui/react'
import TranslatorImage from 'components/TranslatorImage'

function TranslatorsList({ translators, setSelectedModerator, setSelectedTranslator }) {
  const { t } = useTranslation(['common', 'users'])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:text-lg">
        <div className="w-1/3 md:w-2/6">{t('users:Login')}</div>
        <div className="hidden md:block w-2/6">{t('users:Email')}</div>
        <div className="w-1/3 md:w-1/6">{t('Moderator')}</div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {translators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center">
            <div className="flex gap-2 items-center w-1/3 md:w-2/6 truncate">
              <div className="w-8">
                <TranslatorImage item={el} />
              </div>
              <div>{el.users.login}</div>
            </div>
            <div className="hidden md:block w-2/6">{el.users.email}</div>
            <div className="flex items-center w-1/3 md:w-1/6">
              <Switch
                checked={el.is_moderator}
                onChange={() => setSelectedModerator(el.users)}
                className={`${
                  el.is_moderator ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-7 w-12 items-center rounded-full`}
              >
                <span
                  className={`${
                    el.is_moderator ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
            <div className="flex justify-end w-1/3 md:w-1/6">
              <button
                onClick={() => setSelectedTranslator(el.users)}
                className="btn-link-red md:text-xl"
              >
                {t('Remove')}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default TranslatorsList
