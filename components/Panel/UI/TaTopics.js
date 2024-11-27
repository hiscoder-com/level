import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import TaContentInfo from '../Resources/TAContentInfo'
import TAContent from './TAContent'

import { getFile } from 'utils/apiHelper'
import { academyLinks } from 'utils/config'
import { getWordsAcademy, resolvePath } from 'utils/helper'

import Loading from 'public/icons/progress.svg'

function TaTopics() {
  const { locale } = useRouter()

  const config = locale === 'ru' ? academyLinks['ru'] : academyLinks['en']

  const [href, setHref] = useState('intro/ta-intro')
  const [item, setItem] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const updateHref = (newRelativePath) => {
    const { absolutePath } = resolvePath(config.base, href, newRelativePath)
    const newHref = absolutePath.replace(config.base + '/', '')

    if (newHref === href) {
      setHref('')
      setTimeout(() => setHref(newHref), 0)
    } else {
      setHistory((prev) => [...prev, href])
      setHref(newHref)
    }
  }

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev]
      const lastHref = newHistory.pop()
      if (lastHref) setHref(lastHref)
      return newHistory
    })
  }

  useEffect(() => {
    const getData = async () => {
      setLoading(true)
      try {
        const zip = await getFile({
          owner: config.resource.owner,
          repo: config.resource.repo.split('_')[0] + '_ta',
          commit: config.resource.commit,
          apiUrl: '/api/git/ta',
        })

        const fetchedWords = await getWordsAcademy({
          zip,
          href: `${config.base}/${href}`,
        })

        const title = fetchedWords?.['sub-title'] || href
        const text = fetchedWords?.['01'] || href
        const item = {
          title,
          text,
          type: 'ta',
        }
        setItem?.(item)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [href, config.base, config.resource])

  useEffect(() => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.firstElementChild
      if (firstChild) {
        firstChild.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
    }
  }, [item])

  return (
    <div className="relative flex h-screen flex-col">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
          <Loading className="progress-custom-colors right-2 m-auto w-6 animate-spin stroke-th-primary-100" />
        </div>
      )}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <TAContent
          item={item}
          config={config}
          setHref={(newRelativePath) => updateHref(newRelativePath)}
          setItem={setItem}
          goBack={goBack}
          parentItem={item}
        />
      </div>
      <TaContentInfo
        href={href}
        config={config}
        setItem={setItem}
        returnImmediately={true}
      />
    </div>
  )
}

export default TaTopics
