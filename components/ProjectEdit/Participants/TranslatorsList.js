import { useTranslation } from 'next-i18next'
import { Menu, Switch } from '@headlessui/react'
import TranslatorImage from 'components/TranslatorImage'
import Elipsis from 'public/elipsis.svg'
import Security from 'public/security.svg'

function TranslatorsList({
  translators,
  setSelectedModerator,
  setSelectedTranslator,
  access,
}) {
  const { t } = useTranslation(['common', 'users'])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:text-lg">
        <div className="hidden sm:block w-1/3">{t('users:Login')}</div>
        <div className="hidden md:block w-full md:w-1/3">{t('users:Email')}</div>
        <div className="hidden sm:block w-1/3 md:w-1/6">{t('Moderator')}</div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {translators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center  justify-between">
            <div className="flex gap-2 items-center w-1/3">
              <div className="w-8 h-8 min-w-[2rem]">
                <TranslatorImage item={el} />
              </div>
              <div className="hidden sm:block">{el.users.login}</div>
              <div className="block sm:hidden w-1/3">
                <div>{el.users.login}</div>
                <div>{el.users.email}</div>
              </div>
            </div>

            <div className="hidden md:block w-full md:w-1/3">{el.users.email}</div>
            <div className="hidden sm:flex items-center w-1/3 md:w-1/6">
              {access && (
                <Switch
                  checked={el.is_moderator}
                  onChange={() => setSelectedModerator(el.users)}
                  className={`${
                    el.is_moderator ? 'bg-cyan-600' : 'bg-gray-200'
                  } relative inline-flex h-7 w-12 items-center rounded-full`}
                >
                  <span
                    className={`${
                      el.is_moderator ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                  />
                </Switch>
              )}
              {!access && el.is_moderator && (
                <span className="h-5 w-5 rounded-full bg-cyan-600" />
              )}
            </div>
            <div className="flex justify-end w-1/3 md:w-1/6">
              <button
                onClick={() => setSelectedTranslator(el.users)}
                className="hidden sm:block btn-red"
              >
                {t('Remove')}
              </button>
              {el.is_moderator && (
                <Security className="block sm:hidden w-6 h-6 min-h-[1.5rem]" />
              )}
              <Menu as="div" className="relative">
                <Menu.Button>
                  <Elipsis className="block sm:hidden w-6 h-6" />
                </Menu.Button>
                <Menu.Items
                  as="div"
                  className="absolute right-0 bg-teal-200 rounded-xl z-20"
                >
                  <Menu.Item as="div" className="hover:bg-teal-100 p-3 rounded-xl">
                    <button onClick={() => setSelectedModerator(el.users)}>
                      {t('Moderator')}
                    </button>
                  </Menu.Item>
                  <Menu.Item as="div" className="hover:bg-teal-100 p-3 rounded-xl">
                    <button onClick={() => setSelectedTranslator(el.users)}>
                      {t('Remove')}
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default TranslatorsList
