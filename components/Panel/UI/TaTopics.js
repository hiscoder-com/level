import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import CustomComboBox from 'components/CustomComboBox'

import TaContentInfo from '../Resources/TAContentInfo'
import TAContent from './TAContent'

import { getFile } from 'utils/apiHelper'
import { academyLinks } from 'utils/config'
import { getTableOfContent, getWordsAcademy, parseYAML, resolvePath } from 'utils/helper'

import Loading from 'public/icons/progress.svg'

function TaTopics() {
  const { locale } = useRouter()
  const config = locale === 'ru' ? academyLinks['ru'] : academyLinks['en']

  const [href, setHref] = useState('intro/ta-intro')
  const [item, setItem] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const [selectedCategory, setSelectedCategory] = useState('intro')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [topics, setTopics] = useState([])

  const processSections = (sections, parentTitle = '', depth = 0) => {
    return sections.reduce((acc, section) => {
      const { title, link, sections: childSections } = section
      if (title && link) {
        const fullPath = parentTitle ? `${parentTitle} > ${title}` : title
        acc.push({ title: fullPath, link, depth })
      }
      if (childSections && Array.isArray(childSections)) {
        acc.push(...processSections(childSections, fullPath || title, depth + 1))
      }
      return acc
    }, [])
  }

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

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value
    setSelectedCategory(newCategory)
    setSelectedTopic('')
    setHref(`${newCategory}/`)
  }

  const handleTopicChange = (newTopic) => {
    setSelectedTopic(newTopic)
    if (selectedCategory && newTopic) {
      const newHref = `${selectedCategory}/${newTopic}`
      setHref(newHref)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const zip = await getFile({
          owner: config.resource.owner,
          repo: config.resource.repo.split('_')[0] + '_ta',
          commit: config.resource.commit,
          apiUrl: '/api/git/ta',
        })

        const tableContent = await getTableOfContent({
          zip,
          href: `${config.base}/${selectedCategory}/toc.yaml`,
        })
        const yamlString = tableContent['toc.yaml']
        if (!yamlString) throw new Error('YAML-файл не найден')

        const parsedYaml = parseYAML(yamlString)
        const sections = parsedYaml?.sections || []

        const processedTopics = processSections(sections)
        setTopics(processedTopics)

        const fetchedWords = await getWordsAcademy({
          zip,
          href: `${config.base}/${href}`,
        })

        const title = fetchedWords?.['sub-title'] || href
        const text = fetchedWords?.['01'] || href
        setItem({
          title,
          text,
          type: 'ta',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [href, selectedCategory, config.base, config.resource])

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
        <div className="relative z-20 flex items-center gap-4 bg-th-secondary-10 p-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="rounded border border-gray-300 p-2"
          >
            <option value="intro">intro</option>
            <option value="process">process</option>
            <option value="translate">translate</option>
            <option value="checking">checking</option>
          </select>

          <CustomComboBox
            topics={topics}
            selectedTopic={selectedTopic}
            onChange={handleTopicChange}
          />
        </div>

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
