import { useEffect, useRef, useState } from 'react'

import { getFile } from 'utils/apiHelper'
import { getWordsAcademy } from 'utils/helper'

function TaContentInfo({ href, config, setItem, returnImmediately = false }) {
  const [words, setWords] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const hrefRef = useRef(href)

  useEffect(() => {
    if (!config || !config.resource) {
      console.error('Config object is missing or invalid.')
      return
    }

    const getData = async () => {
      setIsLoading(true)
      try {
        const zip = await getFile({
          owner: config.resource.owner,
          repo: config.resource.repo.split('_')[0] + '_ta',
          commit: config.resource.commit,
          apiUrl: '/api/git/ta',
        })
        const fetchedWords = await getWordsAcademy({
          zip,
          href: hrefRef.current,
        })
        setWords(fetchedWords)

        if (returnImmediately) {
          const title =
            fetchedWords?.['sub-title'] || fetchedWords?.sub || hrefRef.current
          const text = fetchedWords?.['01'] || hrefRef.current
          const item = {
            title,
            text,
            type: 'ta',
          }
          setItem?.(item)
        }
      } finally {
        setIsLoading(false)
      }
    }

    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnImmediately, setItem])

  if (isLoading) {
    return <span>Loading...</span>
  }

  const description = words?.['title'] || words?.title || hrefRef.current
  const title = words?.['sub-title'] || words?.sub || hrefRef.current
  const text = words?.['01'] || hrefRef.current
  const item = { title, text, type: 'ta' }

  if (returnImmediately) {
    return null
  }

  return (
    <div
      className="inline-block cursor-pointer text-blue-600 hover:underline"
      onClick={(e) => {
        e.preventDefault()
        setItem?.(item)
      }}
    >
      {description}
    </div>
  )
}
export default TaContentInfo
