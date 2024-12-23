import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import TranslatorImage from 'components/TranslatorImage'

import Elipsis from 'public/icons/elipsis.svg'

function CoordinatorsList({ coordinators, setSelectedCoordinator, access }) {
  const { t } = useTranslation(['common', 'users'])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="hidden w-1/3 md:block">{t('users:Login')}</div>
        <div className="hidden w-full md:block md:w-2/6">{t('users:Email')}</div>
        <div className="w-1/3 md:w-1/6"></div>
        <div className="w-1/3 md:w-1/6"></div>
      </div>
      {coordinators?.map((el) => {
        return (
          <div key={el.users.id} className="flex items-center">
            <div className="flex flex-1 items-center gap-2 truncate sm:w-1/3">
              <div className="h-8 w-8 min-w-[2rem]">
                <TranslatorImage item={el} />
              </div>
              <div className="hidden sm:block">{el.users.login}</div>
              <div className="block truncate sm:hidden">
                <div className="truncate">{el.users.login}</div>
                <div className="truncate">{el.users.email}</div>
              </div>
            </div>
            <div className="hidden md:block md:w-2/6">{el.users.email}</div>
            <div className="hidden w-auto sm:block sm:w-1/3 md:w-1/6"></div>
            <div className="hidden w-1/3 justify-end sm:flex md:w-1/6">
              {access && (
                <>
                  <button
                    onClick={() => setSelectedCoordinator(el.users)}
                    className="btn-red"
                  >
                    {t('Remove')}
                  </button>
                </>
              )}
            </div>
            <Menu as="div" className="relative flex items-center overflow-hidden">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`relative flex transition-all duration-200 ease-in-out`}
                  >
                    <Elipsis className="block h-6 min-h-[1.5rem] w-6 stroke-th-text-primary transition sm:hidden" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    show={open}
                    enter="transition-all duration-200 ease-in-out transform"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transition-all duration-200 ease-in-out transform"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Menu.Items as="div" className="flex gap-2">
                      <Menu.Item
                        as="div"
                        className="btn-red cursor-pointer"
                        onClick={() => setSelectedCoordinator(el.users)}
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
export default CoordinatorsList
