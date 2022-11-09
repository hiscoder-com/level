import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource } from 'utils/hooks'

function TN({ config, url }) {
  const [item, setItem] = useState(null)
  const { loading, data, error } = useGetResource({ config, url })

  return (
    <>
      {loading ? (
        <Placeholder />
      ) : (
        <div className="relative h-full">
          <TNTWLContent setItem={setItem} item={item} />
          <ToolList setItem={setItem} data={data} />
        </div>
      )}
    </>
  )
}

export default TN

function ToolList({ setItem, data }) {
  const { t } = useTranslation('common')
  const [intro, setIntro] = useState([])
  const [verses, setVerses] = useState([])

  useEffect(() => {
    if (data) {
      const { intro, ...verses } = data
      intro && setIntro(intro)
      verses && setVerses(Object.entries(verses))
    }
  }, [data])
  return (
    <div className="divide-y divide-gray-800 divide-dashed h-full overflow-auto">
      <div className="text-center">
        {intro?.map((el, index) => (
          <div
            onClick={() => setItem({ text: el.text, title: t(el.title) })}
            className="mx-2 btn-white my-2"
            key={index}
          >
            {t(el.title)}
          </div>
        ))}
      </div>
      {data &&
        verses.map((el, index) => {
          return (
            <div key={index} className="p-4 flex mx-4">
              <div className="text-2xl">{el[0]}</div>
              <div className="text-gray-700 pl-7">
                <ul>
                  {el[1]?.map((item) => {
                    return (
                      <li
                        key={item.id}
                        className="py-2 cursor-pointer hover:bg-cyan-50"
                        onClick={() => setItem({ text: item.text, title: item.title })}
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
