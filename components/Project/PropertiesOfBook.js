import { useEffect, useState } from 'react'
import axios from 'axios'
import Modal from 'components/Modal'

function PropertiesOfBook({
  projectId,
  book,
  openDownloading,
  setOpenDownloading,
  t,
  type,
  user,
  setUpdatingBooks,
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
            <div>{property}</div>
            <textarea
              className="input"
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
    setUpdatingBooks(true)
    axios
      .put(`/api/book_properties/${book.id}`, {
        properties,
        project_id: projectId,
      })
      .then()
      .catch((err) => console.log(err))
      .finally(() => setUpdatingBooks(false))
  }
  return (
    <div>
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
      </Modal>
    </div>
  )
}
export default PropertiesOfBook
