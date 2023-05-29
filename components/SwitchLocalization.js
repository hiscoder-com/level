import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import i18nextConfig from 'next-i18next.config'

import { Menu } from '@headlessui/react'

function SwitchLocalization() {
  const { locale, asPath, push } = useRouter()
  const { t } = useTranslation('common')
  const supportedLngs = i18nextConfig.i18n.locales
  return (
    <div className="text-xs lg:text-sm font-bold relative">
      <Menu>
        <Menu.Button
          className="px-4 py-2 text-slate-600 text-sm bg-gray-200 rounded-[9rem]"
          onClick={(e) => e.stopPropagation()}
        >
          {t(locale.toUpperCase())}
        </Menu.Button>
        <Menu.Items className="absolute flex top-0 right-0 text-sm bg-gray-200 rounded-2xl">
          <div className="flex flex-col">
            {supportedLngs.map((loc) => (
              <Menu.Item
                key={loc}
                as="div"
                onClick={(e) => {
                  push(asPath, undefined, { locale: loc })
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100 last:rounded-b-2xl first:rounded-t-2xl"
              >
                <div className={`${locale === loc ? 'text-slate-400' : ''}`}>
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
