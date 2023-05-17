import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'

import Property from './Property'
import Breadcrumbs from 'components/Breadcrumbs'
import { Tab } from '@headlessui/react'

function BookProperties({ project, user, bookCode, type, mutateBooks, books }) {
  const { t } = useTranslation()
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])
  const [properties, setProperties] = useState()
  const [translationLink, setTranslationLink] = useState()
  useEffect(() => {
    if (book?.properties) {
      setProperties(book?.properties)
    }
  }, [book?.properties])
  useEffect(() => {
    if (book?.checks) {
      setTranslationLink(book?.checks)
    }
  }, [book])

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
        project_id: project?.id,
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
  const handleSaveLink = () => {}
  return (
    <div className="flex flex-col gap-7 w-full">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + project?.code },
          { title: t('books:' + book?.code) },
        ]}
        full
      />
      <Tab.Group>
        <Tab.List className="grid grid-cols-3 md:grid-cols-8 xl:grid-cols-5 gap-4 mt-2 font-bold text-center border-b border-darkBlue">
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('Properties')}
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('UrlChecks')}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="card flex flex-col py-7">
              <div className="flex flex-col gap-4">{renderProperties}</div>
              <button className="btn-primary mt-7 w-fit" onClick={handleSave}>
                {t('Save')}
              </button>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="card flex flex-col gap-4 py-7">
              <div>{t('TranslationLink')}</div>
              <input
                className="p-2 rounded-lg bg-white text-slate-900 border border-blue-200
       placeholder-blue-200 focus:border-slate-900 focus:outline-none"
                value={translationLink?.url}
                onChange={(e) =>
                  setTranslationLink((prev) => ({ ...prev, url: e.target.value }))
                }
              />
              <div>LevelChecks</div>
              <div className="flex justify-between items-center">
                <div className="flex gap-5">
                  {[...Array(3).keys()]
                    .map((i) => i + 1)
                    .map((el) => (
                      <div className="flex gap-2" key={el}>
                        <input
                          id={el}
                          type="checkbox"
                          className="w-6 h-6 accent-teal-600"
                          checked={translationLink?.level === el}
                          onChange={() =>
                            setTranslationLink((prev) => ({ ...prev, level: el }))
                          }
                        />
                        <label htmlFor={el}>{el}</label>
                      </div>
                    ))}
                </div>
                <button className="btn-primary" onClick={handleSaveLink}>
                  {t('Save')}
                </button>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <Toaster />
    </div>
  )
}
export default BookProperties
