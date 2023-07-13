import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'

import { Tab } from '@headlessui/react'

import Property from './Property'
import Breadcrumbs from 'components/Breadcrumbs'
import { useRouter } from 'next/router'
import Reader from '/public/dictionary.svg'

function BookProperties({ project, user, bookCode, type, mutateBooks, books }) {
  const { query } = useRouter()
  const { t } = useTranslation()
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])
  const [properties, setProperties] = useState()
  useEffect(() => {
    if (book?.properties) {
      setProperties(book?.properties)
    }
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
  const handleSaveProperties = () => {
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

  return (
    <div className="flex flex-col gap-7 w-full">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + project?.code },
          { title: t('books:' + book?.code) },
        ]}
        full
      />

      <Tab.Group defaultIndex={query?.levels ? 1 : 0}>
        <Tab.List className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 mt-2 font-bold text-center border-b border-slate-600">
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('Properties')}
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab')}>
            {t('LevelTranslationChecks')}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="card flex flex-col py-7">
              <div className="flex flex-col gap-4">{renderProperties}</div>
              <button className="btn-primary mt-7 w-fit" onClick={handleSaveProperties}>
                {t('Save')}
              </button>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <LevelChecks
              t={t}
              book={book}
              user={user}
              project={project}
              mutateBooks={mutateBooks}
            />
          </Tab.Panel>
          <Tab.Panel></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <Toaster />
    </div>
  )
}
export default BookProperties

function LevelChecks({ t, book, user, project, mutateBooks }) {
  const levelColor = [
    'checked:bg-emerald-500 checked:border-emerald-500 checked:before:bg-emerald-500',
    'checked:bg-teal-500 checked:border-teal-500 checked:before:bg-teal-500',
    'checked:bg-cyan-700 checked:border-cyan-700 checked:before:bg-cyan-700',
  ]
  const [translationLink, setTranslationLink] = useState()
  const {
    push,
    query: { properties, code },
  } = useRouter()

  const handleSaveLevelChecks = () => {
    if (translationLink) {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/projects/${code}/books/${properties}/level_checks`, {
          level_checks: translationLink,
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
  }

  useEffect(() => {
    if (book?.level_checks) {
      setTranslationLink(book?.level_checks)
    }
  }, [book])
  return (
    <div className="card flex flex-col gap-4 py-7">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <div className="font-bold">{t('TranslationLink')}</div>

          <input
            className="input-primary"
            value={translationLink?.url || ''}
            onChange={(e) =>
              setTranslationLink((prev) => ({ ...prev, url: e.target.value }))
            }
          />
          {book?.level_checks && (
            <div
              className="flex gap-4 cursor-pointer hover:text-teal-500"
              onClick={() =>
                push({
                  pathname: `/projects/${project?.code}/books/read`,
                  query: {
                    bookid: book.code,
                  },
                })
              }
            >
              <div className="font-bold">{t('OpenInReader')}</div>
              <Reader className="w-6 min-w-[1.5rem] cursor-pointer" />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-7 sm:gap-0">
          <div className="flex flex-col gap-4">
            <div className="font-bold">{t('LevelChecks')}</div>
            <div className="flex gap-5">
              {[...Array(3).keys()]
                .map((i) => i + 1)
                .map((el, index) => (
                  <div className="inline-flex items-center" key={el}>
                    <label
                      className="relative flex cursor-pointer items-center rounded-full p-3"
                      htmlFor={el}
                      data-ripple-dark="true"
                    >
                      <input
                        id={el}
                        type="checkbox"
                        className={`w-6 h-6 shadow-sm before:content[''] peer relative cursor-pointer appearance-none rounded-md border border-slate-600 transition-all before:absolute before:top-1/2 before:left-1/2 before:block before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-full before:bg-cyan-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 ${levelColor[index]}`}
                        checked={translationLink?.level === el || false}
                        onChange={() =>
                          setTranslationLink((prev) => ({ ...prev, level: el }))
                        }
                      />
                      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100 stroke-white fill-white">
                        <svg
                          width="15"
                          height="11"
                          viewBox="0 0 15 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.1449 0.762586C14.4429 1.06062 14.4429 1.54382 14.1449 1.84185L5.75017 10.2366C5.45214 10.5346 4.96894 10.5346 4.67091 10.2366L0.855116 6.4208C0.557084 6.12277 0.557084 5.63957 0.855116 5.34153C1.15315 5.0435 1.63635 5.0435 1.93438 5.34153L5.21054 8.61769L13.0656 0.762586C13.3637 0.464555 13.8469 0.464555 14.1449 0.762586Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </label>
                    <label htmlFor={el}>{el}</label>
                  </div>
                ))}
            </div>
          </div>
          <button
            className="btn-primary w-1/2 sm:w-auto self-end sm:self-auto"
            onClick={handleSaveLevelChecks}
          >
            {t('Save')}
          </button>
        </div>
      </div>
    </div>
  )
}
