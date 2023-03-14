import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useGetInfo } from 'utils/hooks'
import { TNTWLContent } from '../UI'

function Info({ config, url, toolName }) {
  const [intro, setIntro] = useState([])
  const [item, setItem] = useState(null)
  const { t } = useTranslation('common')

  const { isLoading, data, error } = useGetInfo({ config, url })

  useEffect(() => {
    if (data) {
      const { intro } = data
      intro && setIntro(intro)
    }
  }, [data])

  return (
    <div className="relative h-full">
      <TNTWLContent setItem={setItem} item={item} />
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
    </div>
  )
}

export default Info
