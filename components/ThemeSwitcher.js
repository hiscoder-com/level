import { Disclosure } from '@headlessui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetTheme } from 'utils/hooks'

import Theme from 'public/themes.svg'
import ArrowDown from 'public/arrow-down.svg'

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
            className={`group flex justify-between items-center w-full px-4 ${
              !open || collapsed ? 'stroke-th-text-primary' : ''
            } ${open ? 'bg-th-secondary-200' : ''}
            } hover:bg-th-secondary-200 hover:opacity-70`}
          >
            <div className="flex gap-2 items-center">
              <div className="py-4">
                <Theme
                  className={`w-5 h-5 ${
                    !open
                      ? 'stroke-th-secondary-300 group-hover:stroke-th-text-primary'
                      : 'stroke-th-text-primary'
                  }`}
                />
              </div>
              <p
                className={`${collapsed && 'lg:hidden'} ${
                  !open
                    ? 'text-th-secondary-300 group-hover:text-th-text-primary'
                    : 'text-th-text-primary'
                }`}
              >
                {t('ChooseTheme')}
              </p>
            </div>
            <ArrowDown
              className={`w-5 h-5 transition-all duration-150 ${
                open ? 'rotate-180' : ''
              } ${collapsed && 'lg:hidden'}`}
            />
          </Disclosure.Button>
          <Disclosure.Panel
            className={`flex space-x-4 box-border mx-1 pl-4 my-4 ${
              collapsed && 'lg:hidden'
            }`}
          >
            {themes.map((theme) => (
              <div key={theme.name} className="relative">
                <div
                  onClick={() => switchTheme(theme.name)}
                  onMouseOver={() => handleMouseOver(theme.name)}
                  onMouseLeave={handleMouseLeave}
                  className={`half-circle w-10 h-10 rotate-45 cursor-pointer ${
                    currentTheme === theme.name
                      ? `border-th-secondary-10 border-2 outline outline-3 ${theme.outline}`
                      : ''
                  } ${theme.className}`}
                />
                <div
                  className={`absolute -top-16 p-4 z-10 bg-th-secondary-200 rounded-xl ${
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
