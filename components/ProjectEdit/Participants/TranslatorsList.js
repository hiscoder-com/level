import { Fragment } from 'react'

import { useTranslation } from 'next-i18next'
import { Menu, Switch, Transition } from '@headlessui/react'
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
      <div className="flex">
        <div className="hidden sm:block w-1/3">{t('users:Login')}</div>
        <div className="hidden md:block w-full md:w-1/3">{t('users:Email')}</div>
        <div className="hidden sm:block w-1/3 md:w-1/6">{t('Moderator')}</div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {translators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center justify-between">
            <div className="flex flex-1 sm:flex-auto gap-2 items-center w-auto sm:w-1/3 truncate">
              <div className="w-8 h-8 min-w-[2rem]">
                <TranslatorImage item={el} />
              </div>
              <div className="hidden sm:block">{el.users.login}</div>
              <div className="block sm:hidden w-auto sm:w-1/3 truncate">
                <div className="truncate">{el.users.login}</div>
                <div className="truncate">{el.users.email}</div>
              </div>
            </div>

            <div className="hidden md:block w-full md:w-1/3">{el.users.email}</div>
            <div className="hidden sm:flex items-center w-1/3 md:w-1/6">
              {access && (
                <Switch
                  checked={el.is_moderator}
                  onChange={() => setSelectedModerator(el.users)}
                  className={`${
                    el.is_moderator ? 'bg-th-primary-100' : 'bg-th-secondary-100'
                  } relative inline-flex h-7 w-12 items-center rounded-full`}
                >
                  <span
                    className={`${
                      el.is_moderator ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-5 w-5 transform rounded-full bg-th-secondary-10 transition`}
                  />
                </Switch>
              )}
              {!access && el.is_moderator && (
                <span className="h-5 w-5 rounded-full bg-th-primary-100" />
              )}
            </div>
            <div className="flex justify-end w-auto sm:w-1/3 md:w-1/6">
              <button
                onClick={() => setSelectedTranslator(el.users)}
                className="hidden sm:block btn-red"
              >
                {t('Remove')}
              </button>
              {el.is_moderator && (
                <Security className="block sm:hidden w-6 h-6 min-h-[1.5rem] stroke-th-text-primary" />
              )}
            </div>
            <Menu as="div" className="relative flex items-center overflow-hidden">
              {({ open }) => (
                <>
                  <Menu.Button>
                    <Elipsis className="block sm:hidden w-6 h-6 min-w-[1.5rem] stroke-th-text-primary" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    show={open}
                    enter="transition-all duration-200 ease-in-out transform"
                    enterFrom="translate-x-0"
                    enterTo="translate-x-0"
                    leave="transition-all duration-200 ease-in-out transform"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Menu.Items as="div" className="flex gap-2 items-center">
                      <Menu.Item
                        as="div"
                        className="cursor-pointer"
                        onClick={() => setSelectedModerator(el.users)}
                      >
                        {access && (
                          <Switch
                            checked={el.is_moderator}
                            onChange={() => setSelectedModerator(el.users)}
                            className={`relative inline-flex items-center h-6 w-12 rounded-full ${
                              el.is_moderator
                                ? 'bg-th-primary-100'
                                : 'bg-th-secondary-100'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-th-secondary-10 transition ${
                                el.is_moderator ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </Switch>
                        )}
                      </Menu.Item>
                      <Menu.Item
                        as="div"
                        className="btn-red cursor-pointer"
                        onClick={() => setSelectedTranslator(el.users)}
                      >
                        {t('Remove')}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          </div>
        )
      })}
    </div>
  )
}
export default TranslatorsList
