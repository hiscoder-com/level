import { useTranslation } from 'next-i18next'

import { Menu } from '@headlessui/react'

import TranslatorImage from 'components/TranslatorImage'

import Elipsis from 'public/elipsis.svg'

function CoordinatorsList({ coordinators, setSelectedCoordinator, access }) {
  const { t } = useTranslation(['common', 'users'])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:text-lg">
        <div className="hidden md:block w-1/3">{t('users:Login')}</div>
        <div className="hidden md:block w-full md:w-2/6">{t('users:Email')}</div>
        <div className="w-1/3 md:w-1/6"></div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {coordinators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center">
            <div className="flex gap-2 items-center w-1/3">
              <div className="w-8 h-8 min-w-[2rem]">
                <TranslatorImage item={el} />
              </div>
              <div className="hidden sm:block">{el.users.login}</div>
              <div className="block sm:hidden">
                <div>{el.users.login}</div>
                <div>{el.users.email}</div>
              </div>
            </div>
            <div className="hidden md:block md:w-2/6">{el.users.email}</div>
            <div className="w-1/3 md:w-1/6"></div>
            <div className="flex justify-end w-1/3 md:w-1/6">
              {access && (
                <>
                  <button
                    onClick={() => setSelectedCoordinator(el.users)}
                    className="hidden sm:block btn-red"
                  >
                    {t('Remove')}
                  </button>
                  <Menu as="div" className="relative">
                    <Menu.Button>
                      <Elipsis className="block sm:hidden w-6 h-6" />
                    </Menu.Button>
                    <Menu.Items
                      as="div"
                      className="absolute right-0 bg-teal-200 rounded-xl z-20"
                    >
                      <Menu.Item as="div" className="hover:bg-teal-100 p-3 rounded-xl">
                        <button onClick={() => setSelectedCoordinator(el.users)}>
                          {t('Remove')}
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default CoordinatorsList
