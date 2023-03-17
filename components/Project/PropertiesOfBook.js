import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import ReactTextareaAutosize from 'react-textarea-autosize'

import Modal from 'components/Modal'

function PropertiesOfBook({
  projectId,
  book,
  openDownloading,
  setOpenDownloading,
  t,
  type,
  user,
  mutateBooks,
}) {
  const [properties, setProperties] = useState()
  useEffect(() => {
    setProperties(book?.properties)
  }, [book?.properties])

  const updateProperty = (text, property) => {
    setProperties((prev) => {
      if (type !== 'obs') {
        return {
          ...prev,
          scripture: { ...prev.scripture, [property]: text },
        }
      } else {
        return {
          ...prev,
          obs: { ...prev.obs, [property]: text },
        }
      }
    })
  }
  const renderProperties =
    properties &&
    Object.entries(type !== 'obs' ? properties?.scripture : properties?.obs)?.map(
      (el, index) => {
        const [property, content] = el
        return (
          <Property
            t={t}
            key={index}
            property={property}
            content={content}
            type={type}
            updateProperty={updateProperty}
          />
        )
      }
    )
  const handleSave = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/book_properties/${book.id}`, {
        properties,
        project_id: projectId,
        user_id: user?.id,
      })

      .then(() => {
        toast.success(t('SaveSuccess'))
        mutateBooks()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  return (
    <Modal isOpen={openDownloading} closeHandle={() => setOpenDownloading(false)}>
      {renderProperties}
      <div className="flex justify-end">
        <button className="btn-cyan mr-2" onClick={handleSave}>
          {t('Save')}
        </button>
        <button className="btn-cyan " onClick={() => setOpenDownloading(false)}>
          {t('Close')}
        </button>
      </div>
      <Toaster
        toastOptions={{
          style: {
            marginTop: '-6px',
            color: '#6b7280',
          },
        }}
      />
    </Modal>
  )
}
export default PropertiesOfBook

function Property({ t, property, content, type, updateProperty }) {
  const [propertyContent, setPropertyContent] = useState()
  useEffect(() => {
    setPropertyContent(content)
  }, [content])
  const additionalLinks = {
    intro:
      'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/front/intro.md',
    back: 'https://git.door43.org/unfoldingWord/en_obs/raw/branch/master/content/back/intro.md',
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
