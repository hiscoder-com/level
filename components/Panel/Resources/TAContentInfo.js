import { useEffect, useState } from 'react'

import { getFile } from 'utils/apiHelper'
import { getWordsAcademy } from 'utils/helper'

function TaContentInfo({ href, config, setItem }) {
  const [words, setWords] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
          href,
        })
        setWords(fetchedWords)
      } finally {
        setIsLoading(false)
      }
    }

    getData()
  }, [href, config])

  if (isLoading) {
    return <span>Loading...</span>
  }

  const description = words?.['title'] || words?.title || href
  const title = words?.['sub-title'] || words?.sub || href
  const text = words?.['01'] || words?.['01'] || href

  return (
    <div
      className="inline-block cursor-pointer text-blue-600 hover:underline"
      onClick={(e) => {
        e.preventDefault()
        setItem?.({ title, text })
      }}
    >
      {description}
    </div>
  )
}
export default TaContentInfo
