import Link from 'next/link'
import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'

function Property({ t, property, content, type, updateProperty }) {
  const [propertyContent, setPropertyContent] = useState()
  useEffect(() => {
    setPropertyContent(content)
  }, [content])
  const additionalLinks = {
    intro: 'https://git.door43.org/ru_gl/ru_obs/raw/branch/master/content/front/intro.md',
    back: 'https://git.door43.org/ru_gl/ru_obs/raw/branch/master/content/back/intro.md',
  }
  return (
    <>
      <div className="inline-block mr-2">
        {t(`book-properties:${property}${type === 'obs' ? '_obs' : ''}`)}
      </div>
      {additionalLinks[property] && (
        <Link href={additionalLinks[property]}>
          <a title={additionalLinks[property]} target="_blank" className="text-blue-450">
            ?
          </a>
        </Link>
      )}

      <ReactTextareaAutosize
        maxRows="5"
        className="input"
        placeholder={t(
          `book-properties:${property}_placeholder${type === 'obs' ? '_obs' : ''}`
        )}
        value={propertyContent}
        onChange={(e) => setPropertyContent(e.target.value)}
        onBlur={() => updateProperty(propertyContent, property)}
      />
    </>
  )
}

export default Property
