import Link from 'next/link'

import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import Down from '/public/arrow-down.svg'
import Gear from '/public/gear.svg'

function Card({ children, title, access, link = '/', isOpen = true, isHidden = false }) {
  const { t } = useTranslation('common')

  return (
    <div className="card flex w-full flex-col gap-3 bg-th-secondary-10 !pb-4 sm:gap-7">
      <div className="flex items-start justify-between gap-7">
        <div className="truncate text-lg font-bold sm:text-xl">{title}</div>
        {access && (
          <Link href={link} className="w-6 min-w-[1.5rem]">
            <Gear className="stroke-th-text-primary" />
          </Link>
        )}
      </div>
      <Disclosure defaultOpen={isOpen}>
        {({ open }) => (
          <>
            <Disclosure.Panel>{children}</Disclosure.Panel>
            <Disclosure.Button>
              {!isHidden && (
                <div className="flex w-full justify-center gap-1 border-t border-th-secondary-300 pt-3 text-th-secondary-300">
                  <span>{t(open ? 'Hide' : 'Open')}</span>
                  <Down
                    className={`w-6 max-w-[1.5rem] stroke-th-secondary-300 ${
                      open ? 'rotate-180 transform' : ''
                    }`}
                  />
                </div>
              )}
            </Disclosure.Button>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export default Card
