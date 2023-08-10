import axios from 'axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function LanguageCreate({ isOpen, closeHandle, user, mutateLanguage, languages }) {
  const { t } = useTranslation(['projects', 'project-edit'])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const handleAddLanguage = async (languageOptions) => {
    try {
      axios.defaults.headers.common['token'] = user?.access_token
      const { error } = await axios.post('/api/languages', languageOptions)
      if (error) throw error
      toast.success(t('SaveSuccess'))
      mutateLanguage()
      reset()
    } catch (error) {
      toast.error(t('SaveFailed'))
      console.log(error)
    }
  }
  const inputs = [
    {
      id: 1,
      title: t('project-edit:LanguageEngName'),
      className: errors?.eng ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('eng', {
          required: true,
          validate: {
            notUnique: (value) => !languages?.find((el) => el.eng === value),
          },
        }),
      },
      errorMessage:
        errors?.eng?.type === 'notUnique'
          ? t('project-edit:NameLanguageNotUnique')
          : errors?.eng?.type === 'required'
          ? t('project-edit:NameLanguageRequired')
          : '',
    },
    {
      id: 2,
      title: t('project-edit:LanguageOrigName'),
      className: errors?.origName ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('origName', {
          required: t('project-edit:OrigNameLanguageRequired'),
        }),
      },
      errorMessage: errors?.origName ? errors?.origName.message : '',
    },
    {
      id: 3,
      title: t('project-edit:LanguageCode'),
      className: errors?.code ? 'input-invalid' : 'input-primary',
      placeholder: '',
      register: {
        ...register('code', {
          required: true,
          validate: {
            notUnique: (value) => !languages?.find((el) => el.code === value),
          },
        }),
      },
      errorMessage:
        errors?.code?.type === 'notUnique'
          ? t('project-edit:CodeLanguageNotUnique')
          : errors?.code?.type === 'required'
          ? t('project-edit:CodeLanguageRequired')
          : '',
    },
  ]
  return (
    <Modal isOpen={isOpen} closeHandle={closeHandle}>
      <form onSubmit={handleSubmit(handleAddLanguage)}>
        <div className="space-y-4">
          {inputs.map((el) => (
            <div key={el.id} className="space-y-2">
              <div>{el.title}</div>
              <input {...el.register} className={el.className} />
              <div className="text-red-600">{el.errorMessage}</div>
            </div>
          ))}
          <div className="flex items-center">
            <label htmlFor={'isGl'}>{t('project-edit:GatewayLanguage')}</label>
            <label
              className="relative flex justify-center items-center p-3 cursor-pointer rounded-full"
              htmlFor="isGl"
              data-ripple-dark="true"
            >
              <input
                id="isGl"
                type="checkbox"
                className="w-6 h-6 shadow-sm before:content[''] peer relative cursor-pointer appearance-none rounded-md border border-cyan-700 bg-white checked:bg-cyan-700 transition-all before:absolute before:top-1/2 before:left-1/2 before:block before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-full before:opacity-0 before:transition-opacity hover:before:opacity-10"
                {...register('isGl', {})}
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
          </div>
          <div className="flex justify-center">
            <div className="flex gap-4 text-xl">
              <button className="btn-secondary">{t('Save')}</button>
              <button type="button" className="btn-secondary" onClick={closeHandle}>
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
export default LanguageCreate
