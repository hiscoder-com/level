import { useRouter } from 'next/router'

import { Menu } from '@headlessui/react'
import { useTranslation } from 'next-i18next'
import i18nextConfig from 'next-i18next.config'

function SwitchLocalization({ collapsed }) {
  const { locale, asPath, push } = useRouter()
  const { t } = useTranslation('common')
  const supportedLngs = i18nextConfig.i18n.locales

  const sortedLngs = [locale, ...supportedLngs.filter((lng) => lng !== locale)]

  return (
    <div
      className={`relative max-w-min text-xs font-bold lg:text-sm ${
        collapsed ? 'lg:hidden' : ''
      } z-[1]`}
    >
      <Menu>
        <Menu.Button
          className="rounded-[9rem] bg-th-text-primary px-4 py-1 text-sm text-th-secondary-10"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </Menu.Button>
        <Menu.Items
          className={`absolute right-0 top-0 rounded-2xl bg-th-text-primary text-sm ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          <div className="flex flex-col">
            {sortedLngs.map((loc) => (
              <Menu.Item
                key={loc}
                as="div"
                onClick={(e) => {
                  push(asPath, undefined, { locale: loc })
                }}
                className="cursor-pointer px-4 py-2 first:rounded-t-2xl last:rounded-b-2xl hover:opacity-70"
              >
                <div
                  className={`${
                    locale === loc ? 'text-th-secondary-10' : 'text-th-secondary-300'
                  }`}
                >
                  {t(loc.toUpperCase())}
                </div>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  )
}

export default SwitchLocalization
