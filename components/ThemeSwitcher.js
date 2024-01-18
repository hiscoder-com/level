const themes = [
  { name: 'default', className: 'bg-slate-550 before:bg-slate-600' },
  { name: 'texttree', className: 'bg-sky-950 before:bg-yellow-500' },
]

const ThemeSwitcher = () => {
  const switchTheme = (newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.className = newTheme
    }
  }

  return (
    <div className="flex space-x-4">
      {themes.map((theme) => (
        <div
          key={theme.name}
          onClick={() => switchTheme(theme.name)}
          className={`half-circle w-10 h-10 rotate-45 cursor-pointer ${theme.className}`}
          title={theme.name}
        />
      ))}
    </div>
  )
}

export default ThemeSwitcher
