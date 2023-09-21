import axios from 'axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'
import CheckboxShevron from 'public/checkbox-shevron.svg'

function LanguageCreate({ isOpen, closeHandle, mutateLanguage, languages }) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const handleAddLanguage = async (languageOptions) => {
    try {
      const { error } = await axios.post('/api/languages', languageOptions)
      if (error) throw error
      toast.success(t('common:SaveSuccess'))
      mutateLanguage()
      reset()
    } catch (error) {
      toast.error(t('common:SaveFailed'))
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
            notUnique: (value) => !languages?.find((language) => language.eng === value),
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
                <CheckboxShevron />
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
