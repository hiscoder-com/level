import { Fragment, useEffect, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'

import { useTranslation } from 'next-i18next'
import { useLanguages, useProjects } from 'utils/hooks'

import Plus from 'public/plus.svg'
import Down from 'public/arrow-down.svg'

function BasicInformation({
  errors,
  register,
  setValue,
  project,
  methods,
  setIsOpenLanguageCreate,
  uniqueCheck = false,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const [projects] = useProjects()
  const [languages] = useLanguages()
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (project !== null && project !== undefined) {
      setSelectedLanguage(project.languages)
    }
  }, [project])

  const filteredLanguages =
    query === ''
      ? languages
      : languages.filter((lang) => {
          const langString = lang.orig_name.toLowerCase()
          return langString.includes(query.toLowerCase())
        })

  const inputs = [
    {
      id: 1,
      title: t('Title'),
      errorCondition: errors?.title,
      placeholder: '',
      register: {
        ...register('title', {
          required: true,
        }),
      },
      errorMessage: errors?.title?.message ?? '',
    },
    {
      id: 2,
      title: t('OrigTitle'),
      errorCondition: errors?.origtitle,
      placeholder: '',
      register: {
        ...register('origtitle', {
          required: true,
        }),
      },
      errorMessage: errors?.title?.message ?? '',
    },
    {
      id: 3,
      title: t('Code'),
      errorCondition: errors?.code,
      placeholder: '',
      register: {
        ...register('code', {
          required: true,
          validate: {
            wrongTypeCode: (value) => /^[a-z\d\-]{2,12}\_[a-z\d\-]{1,12}$/i.test(value),
            notUniqueProject: (value) =>
              uniqueCheck ? !projects?.find((project) => project.code === value) : true,
          },
        }),
      },
      errorMessage:
        errors?.code?.type === 'wrongTypeCode'
          ? t('CodeMessageErrorWrongType')
          : errors?.code?.type === 'notUniqueProject'
          ? t('CodeMessageErrorNotUniqueProject')
          : '',
    },
  ]

  return (
    <div className="flex flex-col gap-3 text-base">
      {inputs.map((input) => (
        <div
          className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4 md:gap-2"
          key={input.title}
        >
          <div className="w-auto md:w-1/5 font-bold">{input.title}</div>
          <div className="flex flex-col gap-2 w-full md:w-4/5">
            <input
              className={
                input?.errorCondition
                  ? 'input-invalid'
                  : 'input-primary bg-th-secondary-10'
              }
              placeholder={input.placeholder}
              {...input.register}
              readOnly={input.readOnly}
            />
            {input.errorMessage && <div>{' ' + input.errorMessage}</div>}
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
        <div className="w-auto md:w-1/5 font-bold">{t('Language')}</div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-4/5">
          <div className="relative w-full md:w-3/4">
            <Combobox
              as={'div'}
              value={selectedLanguage}
              onChange={(e) => {
                setValue('languageId', e.id)
                setSelectedLanguage(e)
              }}
            >
              {({ open }) => (
                <div className="relative text-th-text-primary">
                  <div className="relative overflow-hidden">
                    <Combobox.Input
                      className={`w-full pl-4 pr-10 py-2 border border-th-secondary-300 bg-th-secondary-10 outline-none transition-all duration-100 ease-in-out ${
                        open ? 'rounded-t-lg border-b-0' : 'rounded-lg'
                      }`}
                      displayValue={(language) => language?.orig_name}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 pr-4">
                      <Down className="h-5 w-5 stroke-th-text-primary pointer-events-none" />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition-all ease-in-out duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                  >
                    <Combobox.Options className="absolute w-full max-h-40 overflow-y-auto rounded-b-lg bg-th-secondary-10 border border-t-0 border-th-secondary-300 z-10">
                      {filteredLanguages?.length === 0 && query !== '' ? (
                        <div className="relative select-none px-4 py-2">
                          {t('common:NothingFound')}
                        </div>
                      ) : (
                        filteredLanguages?.map((language) => (
                          <Combobox.Option
                            key={language.id}
                            value={language}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-th-secondary-100' : ''
                              }`
                            }
                          >
                            {({ selected }) => (
                              <span
                                className={`block truncate ${
                                  selected ? 'opacity-70' : ''
                                }`}
                              >
                                {language.orig_name}
                              </span>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              )}
            </Combobox>
          </div>
          <div className="w-full md:w-1/4">
            <button
              type="button"
              className="input-base py-2 flex items-center gap-2 text-th-text-primary border-th-secondary-300 bg-th-secondary-10 truncate"
              onClick={() => setIsOpenLanguageCreate(true)}
            >
              <Plus className="w-6 h-6 min-w-[1.5rem] stroke-2 border-2 border-th-text-primary stroke-th-text-primary rounded-full" />
              <span className="text-sm md:text-base">
                {t('project-edit:AddLanguage')}
              </span>
            </button>
          </div>
        </div>
      </div>
      {methods && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
          <div className="w-auto md:w-1/5 font-bold">{t('Method')}</div>
          <div className="relative flex w-full md:w-4/5">
            <select
              placeholder={t('Method')}
              {...register('methodId')}
              className="input-primary w-3/4 bg-th-secondary-10 appearance-none cursor-pointer"
              defaultValue={methods?.[0]?.id}
            >
              {methods &&
                methods.map((method) => {
                  return (
                    <option key={method.id} value={method.id}>
                      {method.title} ({method.type})
                    </option>
                  )
                })}
            </select>
            <Down className="w-5 h-5 absolute -translate-y-1/2 top-1/2 right-4 stroke-th-text-primary pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInformation
