import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'

function TN({ config, url, toolName }) {
  const [item, setItem] = useState(null)
  const { isLoading, data, error } = useGetResource({ config, url })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <TNTWLContent setItem={setItem} item={item} />
          <ToolList setItem={setItem} data={data} toolName={toolName} />
        </div>
      )}
    </>
  )
}

export default TN

function ToolList({ setItem, data, toolName }) {
  const { t } = useTranslation('common')
  const [intro, setIntro] = useState([])
  const [verses, setVerses] = useState([])
  const { scrollId, handleSave } = useScroll({ toolName })
  useEffect(() => {
    if (data) {
      const { intro, ...verses } = data
      intro && setIntro(intro)
      verses && setVerses(Object.entries(verses))
    }
  }, [data])

  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      {data &&
        verses.map((el, index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7 flex-1">
                <ul>
                  {el[1]?.map((item) => {
                    return (
                      <li
                        key={item.id}
                        id={'id' + item.id}
                        className={`p-2 cursor-pointer hover:bg-gray-200 ${
                          scrollId === 'id' + item.id ? 'bg-gray-200' : ''
                        }`}
                        onClick={() => {
                          handleSave(item.id)
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
        })}
    </div>
  )
}
