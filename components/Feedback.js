import { useState } from 'react'

import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'

function Feedback({ t }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSended, setIsSended] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name || !email || !message) {
      toast.error(t('NotAllFieldFull'))
      setIsError(true)
      return
    }

    setIsError(false)
    axios
      .post('/.netlify/functions/sendFeedback', JSON.stringify({ name, message, email }))
      .then(() => {
        toast.success(t('YourMessageHasBeenSent'))
        setIsSended(true)
        setName('')
        setEmail('')
        setMessage('')
        setIsError(false)
      })
      .catch((err) => {
        console.log({ err })
        toast.error(t('SendFailed'))
        setIsError(true)
      })
  }

  const getInputClassName = (value) =>
    isError && !value ? 'invalid-feedback' : 'input-feedback'

  return (
    <div className="flex flex-col w-full">
      <div className="hidden md:block"> {t('ConnectWithUs')}</div>
      <div
        className="flex flex-grow items-center pb-6 md:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Toaster />
        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {!isSended ? (
            <>
              <input
                type="text"
                className={getInputClassName(name)}
                placeholder={t('users:YourName')}
                onBlur={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className={getInputClassName(email)}
                placeholder={t('users:Email')}
                onBlur={(e) => setEmail(e.target.value)}
              />
              <textarea
                rows="3"
                className={`${getInputClassName(message)} overflow-auto max-h-40`}
                placeholder={t('users:Message')}
                onBlur={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-5 py-4 mt-4 rounded-lg text-center text-sm md:text-base font-medium text-th-text-secondary-100 bg-[#3C6E71]"
              >
                {t('users:Send')}
              </button>
              <p className="text-center text-sm font-light">
                {t('users:ConditionOfConsent')}
              </p>
            </>
          ) : (
            <div className="p-10 w-full text-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {t('YourMessageHasBeenSent')}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Feedback
