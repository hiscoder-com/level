import { Fragment } from 'react'

import { Menu, Switch, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'

import Elipsis from 'public/icons/elipsis.svg'
import Security from 'public/icons/security.svg'

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
        <div className="hidden w-1/3 sm:block">{t('users:Login')}</div>
        <div className="hidden w-full md:block md:w-1/3">{t('users:Email')}</div>
        <div className="hidden w-1/3 sm:block md:w-1/6">{t('Moderator')}</div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {translators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center justify-between">
            <div className="flex w-auto flex-1 items-center gap-2 truncate sm:w-1/3 sm:flex-auto">
              <div className="h-8 w-8 min-w-[2rem]">
                <TranslatorImage item={el} />
              </div>
              <div className="hidden sm:block">{el.users.login}</div>
              <div className="block w-auto truncate sm:hidden sm:w-1/3">
                <div className="truncate">{el.users.login}</div>
                <div className="truncate">{el.users.email}</div>
              </div>
            </div>

            <div className="hidden w-full md:block md:w-1/3">{el.users.email}</div>
            <div className="hidden w-1/3 items-center sm:flex md:w-1/6">
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
            <div className="flex w-auto justify-end sm:w-1/3 md:w-1/6">
              <button
                onClick={() => setSelectedTranslator(el.users)}
                className="btn-red hidden sm:block"
              >
                {t('Remove')}
              </button>
              {el.is_moderator && (
                <Security className="block h-6 min-h-[1.5rem] w-6 stroke-th-text-primary sm:hidden" />
              )}
            </div>
            <Menu as="div" className="relative flex items-center overflow-hidden">
              {({ open }) => (
                <>
                  <Menu.Button>
                    <Elipsis className="block h-6 w-6 min-w-[1.5rem] stroke-th-text-primary sm:hidden" />
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
                    <Menu.Items as="div" className="flex items-center gap-2">
                      <Menu.Item
                        as="div"
                        className="cursor-pointer"
                        onClick={() => setSelectedModerator(el.users)}
                      >
                        {access && (
                          <Switch
                            checked={el.is_moderator}
                            onChange={() => setSelectedModerator(el.users)}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full ${
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
