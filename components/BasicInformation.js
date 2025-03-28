import { Fragment, useEffect, useState } from 'react'

import { Combobox, Transition } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import { calculateRtlDirection } from '@texttree/notepad-rcl'

import { useLanguages, useProjects } from 'utils/hooks'

import Down from 'public/icons/arrow-down.svg'
import Plus from 'public/icons/plus.svg'

function BasicInformation({
  errors,
  register,
  setValue,
  project,
  methods,
  setIsOpenLanguageCreate,
  uniqueCheck = false,
  isCreate = false,
  getValues = () => {},
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const [projects] = useProjects()
  const [languages] = useLanguages()
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [query, setQuery] = useState('')
  const [inputDirections, setInputDirections] = useState({
    title: calculateRtlDirection(getValues('title') || ''),
    origtitle: calculateRtlDirection(getValues('origtitle') || ''),
    code: 'ltr',
  })
  const [languageDirection, setLanguageDirection] = useState(
    calculateRtlDirection(selectedLanguage?.orig_name || '')
  )

  useEffect(() => {
    if (project) {
      setSelectedLanguage(project.languages)
    }
  }, [project])
  const handleInputChange = (e, fieldName) => {
    const value = e.target.value

    const direction = calculateRtlDirection(value || '')
    setInputDirections((prev) => ({
      ...prev,
      [fieldName]: direction,
    }))
  }
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
      readOnly: !isCreate,
    },
  ]

  return (
    <div className="flex flex-col gap-3 text-base">
      {inputs.map((input) => {
        return (
          <div
            className="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:gap-2"
            key={input.title}
          >
            <div className="w-auto font-bold md:w-1/5">{input.title}</div>
            <div className="flex w-full flex-col gap-2 md:w-4/5">
              <input
                dir={inputDirections[input.register.name]}
                className={
                  input?.errorCondition
                    ? 'input-invalid'
                    : 'input-primary bg-th-secondary-10'
                }
                placeholder={input.placeholder}
                {...input.register}
                readOnly={input.readOnly}
                onChange={(e) => handleInputChange(e, input.register.name)}
              />
              {input.errorMessage && <div>{' ' + input.errorMessage}</div>}
            </div>
          </div>
        )
      })}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-2">
        <div className="w-auto font-bold md:w-1/5">{t('Language')}</div>
        <div className="flex w-full flex-col gap-4 md:w-4/5 md:flex-row md:gap-2">
          <div className="relative w-full md:w-3/4">
            <Combobox
              as={'div'}
              value={selectedLanguage}
              onChange={(e) => {
                setValue('languageId', e.id)
                setSelectedLanguage(e)
                setLanguageDirection(calculateRtlDirection(e.orig_name || ''))
              }}
              dir={languageDirection}
            >
              {({ open }) => (
                <div className="relative text-th-text-primary">
                  <div className="relative overflow-hidden">
                    <Combobox.Input
                      className={`w-full border border-th-secondary-300 bg-th-secondary-10 py-2 pl-4 pr-10 outline-none transition-all duration-100 ease-in-out ${
                        open ? 'rounded-t-lg border-b-0' : 'rounded-lg'
                      }`}
                      displayValue={(language) => language?.orig_name}
                      onChange={(event) => {
                        setLanguageDirection(
                          calculateRtlDirection(event.target.value || '')
                        )
                        setQuery(event.target.value)
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 pr-4">
                      <Down className="pointer-events-none h-5 w-5 stroke-th-text-primary" />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition-all ease-in-out duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                  >
                    <Combobox.Options className="absolute z-10 max-h-40 w-full overflow-y-auto rounded-b-lg border border-t-0 border-th-secondary-300 bg-th-secondary-10">
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
              className="input-base flex items-center gap-2 truncate border-th-secondary-300 bg-th-secondary-10 py-2 text-th-text-primary"
              onClick={() => setIsOpenLanguageCreate(true)}
            >
              <Plus className="h-6 w-6 min-w-[1.5rem] rounded-full border-2 border-th-text-primary stroke-th-text-primary stroke-2" />
              <span className="text-sm md:text-base">
                {t('project-edit:AddLanguage')}
              </span>
            </button>
          </div>
        </div>
      </div>
      {methods && (
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-2">
          <div className="w-auto font-bold md:w-1/5">{t('Method')}</div>
          <div className="relative flex w-full md:w-4/5">
            <select
              placeholder={t('Method')}
              {...register('methodId')}
              className="input-primary w-3/4 cursor-pointer appearance-none bg-th-secondary-10"
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
            <Down className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-th-text-primary" />
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInformation
