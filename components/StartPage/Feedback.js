import { useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { toast, Toaster } from 'react-hot-toast'

import ButtonLoading from 'components/ButtonLoading'
import InputField from 'components/Panel/UI/InputField'

function Feedback({ onClose }) {
  const { t } = useTranslation(['start-page', 'projects', 'users', 'common'])
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const router = useRouter()
  const isConnectWithUsPage = router.asPath === '/connect-with-us'

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!feedback.name || !feedback.email || !feedback.message) {
      toast.error(t('NotAllFieldFull'))
      setIsError(true)
      return
    }

    setIsSaving(true)
    axios
      .post('/.netlify/functions/sendFeedback', JSON.stringify(feedback))
      .then(() => {
        toast.success(t('YourMessageHasBeenSent'))
        setIsError(false)
        setIsSent(true)
      })
      .catch((err) => {
        console.log({ err })
        toast.error(t('users:ErrorSending'))
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  return (
    <div className="flex flex-grow items-center" onClick={(e) => e.stopPropagation()}>
      <Toaster />
      {!isSent ? (
        <form className="flex w-full flex-col space-y-4" onSubmit={handleSubmit}>
          <InputField
            name="name"
            type="text"
            id="floating_name"
            label={t('users:YourName')}
            value={feedback.name}
            isError={isError && !feedback.name}
            onChange={handleChange}
          />

          <InputField
            name="email"
            type="email"
            id="floating_email"
            label={t('users:Email')}
            value={feedback.email}
            isError={isError && !feedback.email}
            onChange={handleChange}
          />

          <InputField
            rows="3"
            name="message"
            type="textarea"
            id="floating_message"
            label={t('users:Message')}
            value={feedback.message}
            isError={isError && !feedback.message}
            onChange={handleChange}
            className="mb-3 max-h-40 overflow-auto"
          />

          <ButtonLoading
            type="submit"
            isLoading={isSaving}
            className={`relative rounded-lg px-5 py-4 text-center text-sm font-medium text-th-text-secondary-100 md:text-base ${
              isConnectWithUsPage ? 'bg-slate-550' : 'bg-th-primary-100'
            }`}
          >
            {t('users:Send')}
          </ButtonLoading>
          <p className="text-center text-sm font-light">
            {t('users:ConditionOfConsent')}
          </p>
        </form>
      ) : (
        <div className="w-full text-center">
          <p>{t('users:YourMessageSentThankYou')}</p>
          <button
            className={`mt-14 rounded-lg px-10 py-4 text-center text-sm font-medium text-th-text-secondary-100 md:text-base ${
              isStartPage ? 'bg-slate-550' : 'bg-th-primary-100'
            }`}
            onClick={() => onClose()}
          >
            {t('common:Close')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Feedback
