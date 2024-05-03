import SearchIcon from 'public/search.svg'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function Search({ setSearch }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const handleSearch = useCallback(() => {
    if (!query || query.length < 3) {
      //TODO Нужен перевод
      toast(t('Please enter at least 3 characters'), {
        icon: <SearchIcon className="w-6" />,
      })
      return
    }
    setSearch(query.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSearch()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [handleSearch])
  return (
    <div className="relative flex items-center w-full">
      <input
        className="input-primary bg-th-secondary-50"
        placeholder={t('Search')}
        onChange={(e) => {
          const text = e.target.value
          setQuery(text)
          if (!text) {
            setSearch('')
          }
        }}
        value={query}
      />
      <button className="absolute right-2 z-10 cursor-pointer disabled={isLoading}">
        <SearchIcon
          className="р-6 w-6 stroke-2 stroke-th-secondary-300"
          onClick={handleSearch}
        />
      </button>
    </div>
  )
}
export default Search
