import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { Tab } from '@headlessui/react'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import Breadcrumbs from 'components/Breadcrumbs'
import ButtonLoading from 'components/ButtonLoading'
import CheckBox from 'components/CheckBox'

import Property from './Property'

import Reader from 'public/icons/dictionary.svg'

function BookProperties({ project, user, bookCode, type, mutateBooks, books }) {
  const { query } = useRouter()
  const { t } = useTranslation()
  const book = useMemo(() => books?.find((el) => el.code === bookCode), [bookCode, books])
  const [properties, setProperties] = useState()
  const [isSaving, setIsSaving] = useState(false)

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
    setIsSaving(true)
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
      .finally(() => setIsSaving(false))
  }

  return (
    <div className="flex w-full flex-col">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + project?.code },
          { title: t('books:' + book?.code) },
        ]}
        full
      />
      <Tab.Group defaultIndex={query?.levels ? 1 : 0}>
        <Tab.List className="mt-9 flex w-full gap-4 px-5 text-center font-bold sm:w-2/3">
          <Tab
            className={({ selected }) =>
              `flex-1 ${selected ? 'tab-active' : 'tab-inactive'}`
            }
          >
            {t('Properties')}
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex-1 ${selected ? 'tab-active' : 'tab-inactive'}`
            }
          >
            {t('LevelTranslationChecks')}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <div className="h-10 rounded-t-3xl bg-th-primary-500 px-10"></div>
          <Tab.Panel>
            <div className="flex flex-col rounded-b-2xl border border-th-secondary-300 bg-th-secondary-10 px-10 py-7">
              <div className="flex flex-col gap-4">
                {renderProperties}
                <ButtonLoading onClick={handleSaveProperties} isLoading={isSaving}>
                  {t('Save')}
                </ButtonLoading>
              </div>
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
    </div>
  )
}
export default BookProperties

function LevelChecks({ t, book, user, project, mutateBooks }) {
  const [translationLink, setTranslationLink] = useState()
  const [isSaving, setIsSaving] = useState(false)
  const {
    push,
    query: { properties, code },
  } = useRouter()

  const handleSaveLevelChecks = () => {
    if (translationLink) {
      setIsSaving(true)
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
        .finally(() => setIsSaving(false))
    }
  }
  useEffect(() => {
    if (book?.level_checks) {
      setTranslationLink(book?.level_checks)
    }
  }, [book])
  return (
    <div className="flex flex-col gap-4 rounded-b-2xl border border-th-secondary-300 bg-th-secondary-10 px-10 py-7">
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
              className="flex cursor-pointer gap-4 text-th-primary-200 hover:opacity-70"
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
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end sm:gap-0">
          <div className="flex flex-col gap-4">
            <div className="font-bold">{t('LevelChecks')}</div>
            <div className="flex gap-5">
              {[...Array(3).keys()]
                .map((i) => i + 1)
                .map((el) => (
                  <CheckBox
                    id={el}
                    key={el}
                    onChange={() =>
                      setTranslationLink((prev) => ({ ...prev, level: el }))
                    }
                    checked={translationLink?.level === el || false}
                    className={{
                      accent:
                        'checked:border-th-primary-100 checked:bg-th-primary-100 checked:before:bg-th-primary-100',
                      cursor:
                        'fill-th-secondary-10 stroke-th-secondary-10 text-th-secondary-10',
                    }}
                    label={el}
                  />
                ))}
            </div>
          </div>
          <ButtonLoading onClick={handleSaveLevelChecks} isLoading={isSaving}>
            {t('Save')}
          </ButtonLoading>
        </div>
      </div>
    </div>
  )
}
