import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Disclosure } from '@headlessui/react'

import Gear from '/public/gear.svg'
import Down from '/public/arrow-down.svg'

function Card({ children, title, link = '/', access }) {
  const { t } = useTranslation('common')

  return (
    <div className="card flex flex-col gap-7">
      <div className="flex justify-between items-start gap-7">
        <h3 className="text-2xl font-bold truncate">{title}</h3>
        {access && (
          <Link href={link}>
            <a className="w-6 min-w-[1.5rem]">
              <Gear />
            </a>
          </Link>
        )}
      </div>
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <>
            <Disclosure.Panel>
              <div>{children}</div>
            </Disclosure.Panel>
            <Disclosure.Button className="">
              <div className="flex gap-4 justify-center w-full border-t border-darkBlue">
                <span>{t('Hide')}</span>
                <Down
                  className={`w-6 max-w-[1.5rem] ${open ? 'rotate-180 transform' : ''}`}
                />
              </div>
            </Disclosure.Button>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export default Card
