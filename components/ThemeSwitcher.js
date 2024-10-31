import { useCallback, useEffect, useRef, useState } from 'react'

import { Disclosure } from '@headlessui/react'
import ArrowDown from 'public/arrow-down.svg'
import Theme from 'public/themes.svg'
import { useTranslation } from 'react-i18next'

import { useGetTheme } from 'utils/hooks'

const themes = [
  {
    name: 'default',
    className: 'bg-slate-550 before:bg-slate-550',
    outline: 'outline-slate-550',
  },
  {
    name: 'texttree',
    className: 'bg-sky-950 before:bg-yellow-500',
    outline: 'outline-sky-950',
  },
  {
    name: 'uW',
    className: 'bg-sky-900 before:colors.sky.950',
    outline: 'outline-sky-900',
  },
  {
    name: 'GRA',
    className: 'bg-blue-550 before:bg-blue-650',
    outline: 'outline-blue-550',
  },
]

const ThemeSwitcher = ({ collapsed }) => {
  const theme = useGetTheme()
  const [currentTheme, setCurrentTheme] = useState(theme || 'default')
  const [hoverTheme, setHoverTheme] = useState(false)
  const timeoutRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    setCurrentTheme(theme)
  }, [theme])

  const switchTheme = useCallback((newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.className = newTheme
      setCurrentTheme(newTheme)
    }
  }, [])

  const handleMouseOver = useCallback((themeName) => {
    timeoutRef.current && clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setHoverTheme(themeName)
    }, 750)
  }, [])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setHoverTheme(null)
  }, [])

  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`group flex w-full items-center justify-between px-4 hover:bg-th-secondary-200 ${!collapsed && !open ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center gap-2">
              <div className="py-4">
                <Theme
                  className={`h-5 w-5 ${collapsed ? 'stroke-th-text-primary lg:stroke-th-secondary-300' : ''} ${
                    !collapsed
                      ? open
                        ? 'stroke-th-text-primary'
                        : 'stroke-th-secondary-300 group-hover:stroke-th-text-primary'
                      : ''
                  }`}
                />
              </div>
              <p
                className={`${collapsed ? 'lg:hidden' : ''} ${
                  !open
                    ? 'text-th-text-primary group-hover:text-th-text-primary lg:text-th-secondary-300'
                    : 'text-th-text-primary'
                }`}
              >
                {t('ChooseTheme')}
              </p>
            </div>
            <ArrowDown
              className={`h-5 w-5 transition-all duration-150 ${open ? 'rotate-180' : ''} ${collapsed ? 'lg:hidden' : ''}`}
            />
          </Disclosure.Button>

          <Disclosure.Panel
            className={`mx-1 my-4 box-border flex space-x-2 pl-4 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            {themes.map((theme) => (
              <div key={theme.name} className="relative">
                <div
                  onClick={() => switchTheme(theme.name)}
                  onMouseOver={() => handleMouseOver(theme.name)}
                  onMouseLeave={handleMouseLeave}
                  className={`half-circle h-8 w-8 rotate-45 cursor-pointer ${
                    currentTheme === theme.name
                      ? `outline-3 border-2 border-th-secondary-10 outline ${theme.outline}`
                      : ''
                  } ${theme.className}`}
                />
                <div
                  className={`absolute -top-16 z-10 rounded-xl bg-th-secondary-200 p-4 ${
                    hoverTheme !== theme.name ? 'hidden' : ''
                  }`}
                >
                  {theme.name}
                </div>
              </div>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default ThemeSwitcher
