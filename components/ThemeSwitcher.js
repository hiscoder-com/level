import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetTheme } from 'utils/hooks'

const themes = [
  {
    name: 'default',
    className: 'bg-slate-550 before:bg-yellow-550',
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
    name: 'unfoldingWord',
    className: 'bg-cyan-600 before:bg-cyan-800',
    outline: 'outline-cyan-600',
  },
]

const ThemeSwitcher = () => {
  const theme = useGetTheme()
  const [currentTheme, setCurrentTheme] = useState(theme || 'default')
  const [hoverTheme, setHoverTheme] = useState(false)
  const timeoutRef = useRef(null)
  const { t } = useTranslation('common')

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
    <>
      <div>{t('ChooseTheme')}</div>
      <div className="flex space-x-4 box-border mx-1">
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
      </div>
    </>
  )
}

export default ThemeSwitcher
