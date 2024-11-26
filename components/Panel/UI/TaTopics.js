import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import TaContentInfo from '../Resources/TAContentInfo'
import TAContent from './TAContent'

import { getFile } from 'utils/apiHelper'
import { academyLinks } from 'utils/config'
import { getWordsAcademy, resolvePath } from 'utils/helper'

function TaTopics() {
  const { locale } = useRouter()

  const config = academyLinks[locale] || academyLinks['en']

  const [href, setHref] = useState('intro/ta-intro')
  const [item, setItem] = useState(null)
  const [history, setHistory] = useState([])
  const scrollRef = useRef(null)

  const updateHref = (newRelativePath) => {
    const { absolutePath } = resolvePath(config.base, href, newRelativePath)
    setHistory((prev) => [...prev, href])
    setHref(absolutePath.replace(config.base + '/', ''))
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
