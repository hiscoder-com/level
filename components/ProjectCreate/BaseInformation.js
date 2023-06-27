import { useEffect } from 'react'
import { useLanguages, useProjects } from 'utils/hooks'

function BaseInformation({ t, errors, register, setValue, user, methods }) {
  const [projects, { mutate: mutateProjects }] = useProjects({
    token: user?.access_token,
  })
  const [languages] = useLanguages(user?.access_token)
  useEffect(() => {
    if (languages) {
      setValue('languageId', languages?.[0]?.id)
    }
  }, [languages, setValue])
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
            notUniqueProject: (value) => !projects?.find((el) => el.code === value),
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
    <div className="flex flex-col gap-4">
      {inputs.map((el) => (
        <>
          <div className="flex gap-2 items-center" key={el.title}>
            <div className="w-1/4 font-bold">{el.title}</div>
            <div className="flex flex-col gap-2 w-3/4">
              <input
                className={`${el.classname}`}
                placeholder={el.placeholder}
                {...el.register}
              />
              {el.errorMessage && <div>{' ' + el.errorMessage}</div>}
            </div>
          </div>
        </>
      ))}
      <div className="flex gap-2 items-center">
        <div className="w-1/4 font-bold">{t('Language')}</div>
        <div className="w-3/4">
          <select
            className="input-primary"
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
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className="w-1/4 font-bold">{t('Method')}</div>
        <div className="w-3/4">
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
    </div>
  )
}

export default BaseInformation
