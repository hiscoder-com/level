import { useState } from 'react'

import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'

import ButtonLoading from './ButtonLoading'
import InputField from './Panel/UI/InputField'

function Feedback({ t, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name || !email || !message) {
      toast.error(t('NotAllFieldFull'))
      setIsError(true)
      return
    }

    setIsSaving(true)
    axios
      .post('/.netlify/functions/sendFeedback', JSON.stringify({ name, message, email }))
      .then(() => {
        toast.success(t('YourMessageHasBeenSent'))
        setIsError(false)
        setTimeout(() => {
          onClose()
        }, 2000)
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
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit}>
          <InputField
            name="name"
            type="text"
            id="floating_name"
            label={t('users:YourName')}
            value={name}
            isError={isError && !name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            name="email"
            type="email"
            id="floating_email"
            label={t('users:Email')}
            value={email}
            isError={isError && !email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            rows="3"
            name="message"
            type="textarea"
            id="floating_message"
            label={t('users:Message')}
            value={message}
            isError={isError && !message}
            onChange={(e) => setMessage(e.target.value)}
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
      </div>
    </div>
  )
}

export default Feedback
