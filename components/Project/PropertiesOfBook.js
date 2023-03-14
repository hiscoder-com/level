import { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import Modal from 'components/Modal'

function PropertiesOfBook({
  projectId,
  book,
  openDownloading,
  setOpenDownloading,
  t,
  type,
  user,
}) {
  const [properties, setProperties] = useState()
  useEffect(() => {
    setProperties(book?.properties)
  }, [book?.properties])

  const renderProperties =
    properties &&
    Object.entries(type !== 'obs' ? properties?.scripture : properties?.obs)?.map(
      (el, index) => {
        const [property, content] = el
        return (
          <div key={index}>
            <div>{t(`book-properties:${property}${type === 'obs' ? '_obs' : ''}`)}</div>
            <textarea
              className="input"
              placeholder={t(`book-properties:${property}_placeholder`)}
              defaultValue={content}
              onChange={(e) => {
                setProperties((prev) => {
                  if (type !== 'obs') {
                    return {
                      ...prev,
                      scripture: { ...prev.scripture, [property]: e.target.value },
                    }
                  } else {
                    return {
                      ...prev,
                      obs: { ...prev.obs, [property]: e.target.value },
                    }
                  }
                })
              }}
            />
          </div>
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

      .then(toast.success(t('SaveSuccess')))
      .catch((err) => {
        toast.success(t('SaveFailed'))
        console.log(err)
      })
  }
  return (
    <Modal
      isOpen={openDownloading}
      closeHandle={() => {
        setOpenDownloading(false)
      }}
    >
      {renderProperties}
      <div className="flex justify-end">
        <button
          className="btn-cyan mr-2"
          onClick={() => {
            handleSave()
          }}
        >
          {t('common:Save')}
        </button>
        <button
          className="btn-cyan "
          onClick={() => {
            setOpenDownloading(false)
          }}
        >
          {t('common:Close')}
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
