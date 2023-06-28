import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'
import { checkLSVal, filterNotes, getWords } from 'utils/helper'
import { getFile } from 'utils/apiHelper'

function TWL({ config, url, toolName }) {
  const [item, setItem] = useState(null)
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
      const words = await getWords({
        zip,
        repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
        wordObjects: data,
      })
      const finalData = {}
      words?.forEach((word) => {
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
          url: TWLink,
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
        <TNTWLContent setItem={setItem} item={item} />
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
      className={`divide-y divide-gray-800 divide-dashed h-full overflow-auto ${
        isLoading ? 'px-4' : ''
      }`}
    >
      <div className="text-center">
        {<FilterRepeated filter={filter} setFilter={setFilter} />}
      </div>
      {isLoading ? (
        <div className="pt-4 pr-4">
          <Placeholder />
        </div>
      ) : (
        verses?.map(([verseNumber, words], verseIndex) => {
          return (
            <div key={verseIndex} className="p-4 flex mx-4" id={'idtwl' + verseNumber}>
              <div className="text-2xl">{verseNumber}</div>
              <div className="text-gray-700 pl-7 flex-1">
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
                        className={`p-2 cursor-pointer ${
                          itemFilter ? 'text-gray-400' : ''
                        } hover:bg-gray-200
                      ${highlightId === 'id' + item.id ? 'bg-gray-200' : ''}
                      `}
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
    <div className="flex items-center justify-center">
      <div className="">{t('FilterRepeatedWords')}</div>
      <select
        className="input m-2 !w-auto"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {options?.map((option) => (
          <option value={option.value} key={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
