import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import Close from 'public/close.svg'
import i18nextConfig from 'next-i18next.config'
import { Menu } from '@headlessui/react'

function SwitchLocalization() {
  const { locale, pathname, query, asPath, push } = useRouter()
  const { t } = useTranslation('common')
  const supportedLngs = i18nextConfig.i18n.locales
  return (
    <div className="text-xs lg:text-sm font-bold relative">
      <Menu>
        <Menu.Button
          className={`bg-teal-100 text-teal-400 rounded-[9rem] px-4 py-2 `}
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </Menu.Button>
        <Menu.Items className="absolute flex top-0 right-0 bg-teal-100 rounded-2xl">
          <div className="flex flex-col   gap-4 p-4">
            {supportedLngs.map((loc) => (
              <Menu.Item
                key={loc}
                as="div"
                onClick={(e) => {
                  e.stopPropagation()
                  push(asPath, undefined, { locale: loc })
                }}
                className="cursor-pointer"
              >
                <div className={`${locale === loc ? 'text-teal-400' : ''}`}>
                  {t(loc.toUpperCase())}
                </div>
              </Menu.Item>
            ))}
          </div>
          <Menu.Item>
            {({ close }) => (
              <div>
                <Close
                  className="m-2 w-4 h-4 stroke-teal-400 cursor-pointer"
                  onClick={close}
                />
              </div>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  )
}

export default SwitchLocalization
