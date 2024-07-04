import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure } from '@headlessui/react'

import Gear from '/public/gear.svg'
import Down from '/public/arrow-down.svg'

function Card({ children, title, access, link = '/', isOpen = true, isHidden = false }) {
  const { t } = useTranslation('common')

  return (
    <div className="card flex flex-col w-full gap-3 sm:gap-7 bg-th-secondary-10 !pb-4">
      <div className="flex justify-between items-start gap-7">
        <div className="text-lg sm:text-xl font-bold truncate">{title}</div>
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
                <div className="flex gap-1 justify-center w-full pt-3 border-t border-th-secondary-300 text-th-secondary-300">
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
