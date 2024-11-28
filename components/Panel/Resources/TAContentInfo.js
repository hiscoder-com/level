import { useEffect, useRef, useState } from 'react'

import { getFile } from 'utils/apiHelper'
import { getWordsAcademy } from 'utils/helper'

import Loading from 'public/icons/progress.svg'

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
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getData()
  }, [config, returnImmediately, setItem])

  if (isLoading) {
    return (
      <Loading className="progress-custom-colors right-2 m-auto w-6 animate-spin stroke-th-primary-100" />
    )
  }

  if (!words) return null

  const description = words['title'] || words.title || hrefRef.current
  const title = words['sub-title'] || words.sub || hrefRef.current
  const text = words['01'] || hrefRef.current
  const item = { title, text, type: 'ta' }

  if (returnImmediately) {
    return null
  }

  return (
    <div
      className="inline-block cursor-pointer text-[#0969da] hover:underline"
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
