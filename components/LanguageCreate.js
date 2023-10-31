import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'

import Modal from './Modal'
import ButtonLoading from './ButtonLoading'
import CheckBox from './CheckBox'

function LanguageCreate({ isOpen, closeHandle, mutateLanguage, languages }) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const handleAddLanguage = async (languageOptions) => {
    setIsSaving(true)
    try {
      const { error } = await axios.post('/api/languages', languageOptions)
      if (error) throw error
      toast.success(t('common:SaveSuccess'))
      mutateLanguage()
      reset()
    } catch (error) {
      toast.error(t('common:SaveFailed'))
      console.log(error)
    } finally {
      setIsSaving(false)
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
              <div className="text-th-invalid">{el.errorMessage}</div>
            </div>
          ))}
          <CheckBox
            className={{
              accent:
                'bg-th-second-check checked:bg-th-secondary-background checked:border-th-primary checked:before:bg-th-secondary-background border-th-primary-border',
              cursor: 'fill-th-primary-text text-th-primary-text stroke-th-primary-text',
              wrapper: 'flex-row-reverse justify-between',
            }}
            label={t('project-edit:GatewayLanguage')}
            {...register('isGl', {})}
          />
          <div className="flex justify-center">
            <div className="flex gap-4 text-xl">
              <ButtonLoading className="relative btn-secondary" isLoading={isSaving}>
                {t('Save')}
              </ButtonLoading>
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
