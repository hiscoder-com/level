import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import ReactMarkdown from 'react-markdown'

import { Placeholder, TNTWLContent } from '../UI'

import { getFile } from 'utils/apiHelper'
import { checkLSVal, filterNotes, getWord, getWords } from 'utils/helper'
import { useGetResource, useScroll } from 'utils/hooks'

import Down from 'public/icons/arrow-down.svg'

function TWL({ config, url, toolName }) {
  const [item, setItem] = useState(null)
  const [href, setHref] = useState(null)
  const [zip, setZip] = useState(null)
  useEffect(() => {
    const fetchWordData = async () => {
      if (href && data.length > 0) {
        const word = await getWord({
          zip,
          repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
          TWLink: href,
        })
        const newItem = {
          title: word?.title || '',
          text: word?.text || '',
        }

        setItem(newItem)
      }
    }

    fetchWordData()

    // eslint-disable-next-line
  }, [href, config.resource.repo])

  const { isLoading, data } = useGetResource({ config, url })
  const [wordObjects, setWordObjects] = useState([])
  const [isLoadingTW, setIsLoadingTW] = useState(false)
  useEffect(() => {
    const getData = async () => {
      setIsLoadingTW(true)
      const zip = await getFile({
        owner: config.resource.owner,
        repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
        commit: config.resource.commit,
        apiUrl: '/api/git/tw',
      })
      setZip(zip)
      const words = await getWords({
        zip,
        repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
        wordObjects: data,
      })
      const finalData = {}
      words?.forEach((word) => {
        if (!word) return null

        const {
          ID,
          Reference,
          TWLink,
          isRepeatedInBook,
          isRepeatedInChapter,
          isRepeatedInVerse,
          text,
          title,
        } = word
        const wordObject = {
          id: ID,
          title,
          text,
          url: TWLink, // TODO уточнить где используется
          isRepeatedInBook,
          isRepeatedInChapter,
          isRepeatedInVerse,
        }

        const [, verse] = Reference.split(':')
        filterNotes(wordObject, verse, finalData)
      })
      setIsLoadingTW(false)
      setWordObjects(finalData)
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <>
      <div className="relative h-full">
        <TNTWLContent setItem={setItem} item={item} setHref={setHref} config={config} />
        <TWLList
          setItem={setItem}
          data={wordObjects}
          toolName={toolName}
          isLoading={isLoadingTW || isLoading}
        />
      </div>
    </>
  )
}

export default TWL

function TWLList({ setItem, data, toolName, isLoading }) {
  const [verses, setVerses] = useState([])
  const [filter, setFilter] = useState(() => {
    return checkLSVal('filter_words', 'disabled', 'string')
  })
  const { highlightId, handleSaveScroll } = useScroll({
    toolName,
    isLoading,
    idPrefix: 'idtwl',
  })

  useEffect(() => {
    localStorage.setItem('filter_words', filter)
  }, [filter])

  useEffect(() => {
    if (data) {
      setVerses(Object.entries(data))
    }
  }, [data])

  return (
    <div
      id={`container_${toolName}`}
      className={`h-full divide-y divide-dashed divide-th-text-primary overflow-auto ${
        isLoading ? 'px-4' : ''
      }`}
    >
      <div className="mb-2 text-center">
        {<FilterRepeated filter={filter} setFilter={setFilter} />}
      </div>
      {isLoading ? (
        <div className="pr-4 pt-4">
          <Placeholder />
        </div>
      ) : (
        verses?.map(([verseNumber, words], verseIndex) => {
          return (
            <div key={verseIndex} className="mx-4 flex p-4" id={`idtwl_${verseNumber}`}>
              <div className="text-2xl">{verseNumber}</div>
              <div className="flex-1 pl-7">
                <ul>
                  {words?.map((item, index) => {
                    let itemFilter
                    switch (filter) {
                      case 'disabled':
                        itemFilter = false
                        break
                      case 'verse':
                        itemFilter = item.isRepeatedInVerse
                        break
                      case 'book':
                        itemFilter = item.isRepeatedInBook
                        break
                      default:
                        break
                    }

                    return (
                      <li
                        key={index}
                        id={'id' + item.id}
                        className={`cursor-pointer rounded-lg p-2 ${
                          itemFilter ? 'text-th-secondary-300' : ''
                        } hover:bg-th-secondary-100 ${highlightId === 'id' + item.id ? 'bg-th-secondary-100' : ''} `}
                        onClick={() => {
                          handleSaveScroll(verseNumber, item.id)
                          setItem({ text: item.text, title: item.title })
                        }}
                      >
                        <ReactMarkdown>{item.title}</ReactMarkdown>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function FilterRepeated({ setFilter, filter }) {
  const { t } = useTranslation('common')
  const options = [
    { value: 'verse', name: t('ByVerse') },
    { value: 'book', name: t('ByBook') },
    { value: 'disabled', name: t('Disabled') },
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="hidden sm:block md:w-1/2">{t('FilterRepeatedWords')}</div>
      <div className="relative mr-2 w-full sm:w-1/2">
        <select
          className="input-primary appearance-none truncate"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '10px' }}
        >
          {options?.map((option) => (
            <option className="mr-2" value={option.value} key={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <Down className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-th-text-primary" />
      </div>
    </div>
  )
}
