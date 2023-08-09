import { useTranslation } from 'next-i18next'
import { useLanguages, useProjects } from 'utils/hooks'

import Plus from '/public/plus.svg'

function BasicInformation({
  errors,
  register,
  user,
  methods,
  setIsOpenLanguageCreate,
  uniqueCheck = false,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const [projects, { mutate: mutateProjects }] = useProjects({
    token: user?.access_token,
  })
  const [languages, { mutate: mutateLanguage }] = useLanguages(user?.access_token)
  const inputs = [
    {
      id: 1,
      title: t('Title'),
      classname: errors?.title ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('title', {
          required: true,
        }),
      },
      errorMessage: errors?.title ? errors?.title.message : '',
    },
    {
      id: 2,
      title: t('OrigTitle'),
      classname: errors?.origtitle ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('origtitle', {
          required: true,
        }),
      },
      errorMessage: errors?.origtitle ? errors?.origtitle.message : '',
    },
    {
      id: 3,
      title: t('Code'),
      classname: errors?.code ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('code', {
          required: true,
          validate: {
            wrongTypeCode: (value) => /^[a-z\d\-]{2,12}\_[a-z\d\-]{1,12}$/i.test(value),
            notUniqueProject: (value) =>
              uniqueCheck ? !projects?.find((el) => el.code === value) : true,
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
    <div className="flex flex-col gap-3 text-sm md:text-base">
      {inputs.map((el) => (
        <div
          className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4 md:gap-2"
          key={el.title}
        >
          <div className="w-auto md:w-1/5 font-bold">{el.title}</div>
          <div className="flex flex-col gap-2 w-full md:w-4/5">
            <input
              className={`${el.classname}`}
              placeholder={el.placeholder}
              {...el.register}
            />
            {el.errorMessage && <div>{' ' + el.errorMessage}</div>}
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
        <div className="w-auto md:w-1/5 font-bold">{t('Language')}</div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-4/5">
          <select
            className="input-primary md:w-3/4"
            placeholder={t('Language')}
            {...register('languageId')}
          >
            {languages &&
              languages.map((el) => {
                return (
                  <option key={el.id} value={el.id}>
                    {el.orig_name}
                  </option>
                )
              })}
          </select>
          <div className="md:w-1/4">
            <button
              type="button"
              className="input-primary flex items-center justify-start md:justify-around gap-2 truncate"
              onClick={() => setIsOpenLanguageCreate(true)}
            >
              <div className="border border-slate-900 rounded-full">
                <Plus className="w-4 h-4" />
              </div>

              <span>{t('project-edit:AddLanguage')}</span>
            </button>
          </div>
        </div>
      </div>
      {methods && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2">
          <div className="w-auto md:w-1/5 font-bold">{t('Method')}</div>
          <div className="w-full md:w-4/5">
            <select
              placeholder={t('Method')}
              {...register('methodId')}
              className="input-primary w-3/4"
              defaultValue={methods?.[0]?.id}
            >
              {methods &&
                methods.map((el) => {
                  return (
                    <option key={el.id} value={el.id}>
                      {el.title} ({el.type})
                    </option>
                  )
                })}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInformation
