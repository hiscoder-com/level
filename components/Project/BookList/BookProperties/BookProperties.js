import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import toast from 'react-hot-toast'

import { Tab } from '@headlessui/react'

import Property from './Property'
import ButtonLoading from 'components/ButtonLoading'
import Breadcrumbs from 'components/Breadcrumbs'
import CheckBox from 'components/CheckBox'

import Reader from 'public/dictionary.svg'

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
    <div className="flex flex-col w-full">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + project?.code },
          { title: t('books:' + book?.code) },
        ]}
        full
      />
      <Tab.Group defaultIndex={query?.levels ? 1 : 0}>
        <Tab.List className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 mt-9 px-5 font-bold text-center">
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab-inactive')}>
            {t('Properties')}
          </Tab>
          <Tab className={({ selected }) => (selected ? 'tab-active' : 'tab-inactive')}>
            {t('LevelTranslationChecks')}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <div className="bg-th-primary h-10 rounded-t-3xl px-10"></div>
          <Tab.Panel>
            <div className="px-10 border border-th-border-secondary rounded-b-2xl bg-th-background-secondary flex flex-col py-7">
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
  const levelColor = [
    'checked:bg-th-first-check checked:border-th-first-check checked:before:bg-th-first-check',
    'checked:bg-th-second-check checked:border-th-second-check checked:before:bg-th-second-check',
    'checked:bg-th-third-check checked:border-th-third-check checked:before:bg-th-third-check',
  ]
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
    <div className="px-10 border border-th-border-secondary rounded-b-2xl bg-th-background-secondary flex flex-col gap-4 py-7">
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
              className="flex gap-4 cursor-pointer text-th-link hover:text-th-link-hover"
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
                  <CheckBox
                    key={el}
                    onChange={() =>
                      setTranslationLink((prev) => ({ ...prev, level: el }))
                    }
                    checked={translationLink?.level === el || false}
                    className={{
                      accent: levelColor[index],
                      cursor:
                        'fill-th-background-secondary stroke-th-background-secondary text-th-background-secondary',
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
