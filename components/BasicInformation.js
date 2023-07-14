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
    <>
      <div className="flex flex-col gap-4">
        {inputs.map((el) => (
          <div className="flex gap-2 items-center" key={el.title}>
            <div className="w-1/5 font-bold">{el.title}</div>
            <div className="flex flex-col gap-2 w-4/5">
              <input
                className={`${el.classname}`}
                placeholder={el.placeholder}
                {...el.register}
              />
              {el.errorMessage && <div>{' ' + el.errorMessage}</div>}
            </div>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <div className="w-1/5 font-bold">{t('Language')}</div>
          <div className="flex gap-2 w-4/5">
            <select
              className="input-primary w-3/4"
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
            <div className="w-1/4">
              <button
                type="button"
                className="input-primary flex items-center justify-around gap-1 truncate"
                onClick={() => setIsOpenLanguageCreate(true)}
              >
                <div className="rounded-full p-1 border border-slate-900 w-fit">
                  <Plus className="w-5 " />
                </div>

                <span className="hidden lg:block">{t('AddLanguage')}</span>
              </button>
            </div>
          </div>
        </div>
        {methods && (
          <div className="flex gap-2 items-center">
            <div className="w-1/5 font-bold">{t('Method')}</div>
            <div className="w-4/5">
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
    </>
  )
}

export default BasicInformation
