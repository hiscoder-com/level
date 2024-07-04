import { useState } from 'react'

import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'

import ButtonLoading from 'components/ButtonLoading'
import InputField from 'components/Panel/UI/InputField'

function Feedback({ t, onClose }) {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSent, setIsSent] = useState(false)

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
    <div className="flex flex-col w-full gap-6 md:gap-0">
      <p className="font-semibold md:font-bold">{t('ConnectWithUs')}</p>
      <div className="flex flex-grow items-center" onClick={(e) => e.stopPropagation()}>
        <Toaster />
        {!isSent ? (
          <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit}>
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
              className="overflow-auto max-h-40 mb-3"
            />

            <ButtonLoading
              type="submit"
              isLoading={isSaving}
              className="relative px-5 py-4 rounded-lg text-center text-sm md:text-base font-medium text-th-text-secondary-100 bg-slate-550"
            >
              {t('users:Send')}
            </ButtonLoading>
            <p className="text-center text-sm font-light">
              {t('users:ConditionOfConsent')}
            </p>
          </form>
        ) : (
          <div className="text-center w-full">
            <p>{t('users:YourMessageSentThankYou')}</p>
            <button
              className="px-10 py-4 mt-14 rounded-lg text-center text-sm md:text-base font-medium text-th-text-secondary-100 bg-slate-550"
              onClick={() => onClose()}
            >
              {t('common:Close')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feedback
