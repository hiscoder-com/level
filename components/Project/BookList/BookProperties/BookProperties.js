import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import Modal from 'components/Modal'
import Property from './Property'
import { useTranslation } from 'next-i18next'
import BreadCrumb from 'components/ProjectEdit/BreadCrumb'

function BookProperties({
  bookCode,
  openDownloading,
  setOpenDownloading,
  type,
  user,
  mutateBooks,
  books,
  project,
}) {
  const { t } = useTranslation()
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])
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
      ([property, content], index) => (
        <Property
          t={t}
          key={index}
          property={property}
          content={content}
          type={type}
          updateProperty={updateProperty}
        />
      )
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
    <div>
      <BreadCrumb
        links={[{ title: project?.title, href: '/projects/' + project?.code }]}
      />

      <div className="flex flex-wrap">{renderProperties}</div>

      <Toaster />
    </div>
  )
}
export default BookProperties
