import { useCallback, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import yaml from 'js-yaml'

import TaContentInfo from '../Resources/TAContentInfo'
import TAContent from './TAContent'

import { getFile } from 'utils/apiHelper'
import { academyLinks } from 'utils/config'
import {
  getTableOfContent,
  getTitleOfContent,
  getWordsAcademy,
  parseYAML,
  resolvePath,
} from 'utils/helper'

import Loading from 'public/icons/progress.svg'

function TaTopics() {
  const { locale } = useRouter()
  const config = locale === 'ru' ? academyLinks['ru'] : academyLinks['en']

  const [href, setHref] = useState('intro/ta-intro')
  const [item, setItem] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [topics, setTopics] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])

  const processSections = useCallback((sections, parentTitle = '', depth = 0) => {
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
  }, [])

  const handleCategoryChange = useCallback(
    (event) => {
      const newCategory = event.target.value
      setSelectedCategory(newCategory)
      setSelectedTopic('')

      const fetchTopicsForCategory = async () => {
        try {
          setLoading(true)

          const zip = await getFile({
            owner: config.resource.owner,
            repo: config.resource.repo.split('_')[0] + '_ta',
            commit: config.resource.commit,
            apiUrl: '/api/git/ta',
          })

          const tableContent = await getTableOfContent({
            zip,
            href: `${config.base}/${newCategory}/toc.yaml`,
          })

          const yamlString = tableContent['toc.yaml']
          if (!yamlString) throw new Error('YAML-файл не найден')

          const parsedYaml = parseYAML(yamlString)
          const sections = parsedYaml?.sections || []

          const processedTopics = processSections(sections)
          setTopics(processedTopics)
        } catch (error) {
          console.error('Ошибка загрузки тем для категории:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchTopicsForCategory()
    },
    [config.base, config.resource, processSections]
  )

  const handleTopicChange = useCallback(
    async (newTopic) => {
      setSelectedTopic(newTopic)
      if (selectedCategory && newTopic) {
        const newHref = `${selectedCategory}/${newTopic}`
        setHref(newHref)

        try {
          setLoading(true)
          const zip = await getFile({
            owner: config.resource.owner,
            repo: config.resource.repo.split('_')[0] + '_ta',
            commit: config.resource.commit,
            apiUrl: '/api/git/ta',
          })

          const fetchedWords = await getWordsAcademy({
            zip,
            href: `${config.base}/${newHref}`,
          })

          const title = fetchedWords?.['sub-title'] || newHref
          const text = fetchedWords?.['01'] || newHref
          setItem({
            title,
            text,
            type: 'ta',
          })
        } catch (error) {
          console.error('Error fetching topic content:', error)
        } finally {
          setLoading(false)
        }
      }
    },
    [selectedCategory, config.base, config.resource]
  )
  useEffect(() => {
    if (topics.length > 0 && selectedCategory) {
      const isCurrentTopicValid = topics.some((topic) => topic.link === selectedTopic)
      if (!isCurrentTopicValid) {
        const firstTopicLink = topics[0].link
        setSelectedTopic(firstTopicLink)
        setHref(`${selectedCategory}/${firstTopicLink}`)
      }
    }
  }, [topics, selectedCategory])

  const updateHref = useCallback(
    (newRelativePath) => {
      const { absolutePath } = resolvePath(config.base, href, newRelativePath)
      const newHref = absolutePath.replace(`${config.base}/`, '')

      if (newHref === href) {
        setHref('')
        setTimeout(() => setHref(newHref), 0)
      } else {
        setHistory((prev) => [...prev, href])
        setHref(newHref)
      }

      const [newCategory, newTopic] = newHref.split('/')
      if (newCategory && newCategory !== selectedCategory) {
        setSelectedCategory(newCategory)
        setSelectedTopic(newTopic || '')
      } else if (newTopic && newTopic !== selectedTopic) {
        setSelectedTopic(newTopic)
      }
    },
    [href, config.base, selectedCategory, selectedTopic]
  )

  const goBack = useCallback(() => {
    setHistory((prev) => {
      const newHistory = [...prev]
      const lastHref = newHistory.pop()
      if (lastHref) setHref(lastHref)
      return newHistory
    })
  }, [])

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

        const titleContent = await getTitleOfContent({
          zip,
          href: `${config.base}/manifest.yaml`,
        })

        const titleContentDataString = titleContent['manifest.yaml']
        const titleContentData = yaml.load(titleContentDataString)

        const projects = titleContentData?.projects
        if (!projects || projects.length === 0) {
          console.error('Projects not found in manifest.yaml')
          return
        }

        const projectOptions = projects.map((project) => ({
          value: project.identifier,
          label: project.title,
        }))
        setCategoryOptions(projectOptions)

        if (!selectedCategory) {
          setSelectedCategory(projectOptions[0]?.value || '')
        }

        const tableContent = await getTableOfContent({
          zip,
          href: `${config.base}/${selectedCategory || projectOptions[0]?.value || ''}/toc.yaml`,
        })

        const yamlString = tableContent['toc.yaml']
        if (!yamlString) throw new Error('YAML file not found')

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
  }, [href, selectedCategory, config.base, config.resource, processSections])

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
        <div className="relative z-20 flex flex-col gap-4 bg-th-secondary-10 p-4">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="rounded border border-gray-300 p-2"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="rounded border border-gray-300 p-2"
          >
            {topics.map((topic) => (
              <option key={topic.link} value={topic.link}>
                {topic.title}
              </option>
            ))}
          </select>
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
        returnImmediately={false}
        enableArticleFiltering={false}
      />
    </div>
  )
}

export default TaTopics
