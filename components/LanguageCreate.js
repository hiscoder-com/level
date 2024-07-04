import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'
import ButtonLoading from 'components/ButtonLoading'
import CheckBox from 'components/CheckBox'

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
          {inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <div>{input.title}</div>
              <input {...input.register} className={input.className} />
              <div className="text-th-invalid">{input.errorMessage}</div>
            </div>
          ))}
          <CheckBox label={t('project-edit:GatewayLanguage')} {...register('isGl', {})} />
          <CheckBox label={t('project-edit:Rtl')} {...register('isRtl', {})} />

          <div className="flex justify-center">
            <div className="flex gap-4 text-xl">
              <ButtonLoading className="relative btn-secondary" isLoading={isSaving}>
                {t('common:Save')}
              </ButtonLoading>
              <button type="button" className="btn-secondary" onClick={closeHandle}>
                {t('common:Close')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
export default LanguageCreate
