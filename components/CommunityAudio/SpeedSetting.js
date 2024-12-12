import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

export default function SpeedSetting({ textSpeed, setTextSpeed }) {
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useTranslation(['common'])

  const minSpeed = 1
  const maxSpeed = 15

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex items-center gap-2 space-x-2">
      <div className="grid h-10 w-20 grid-cols-2 overflow-hidden rounded-full border border-th-primary-100">
        <button
          className="flex items-center justify-center border border-e-th-primary-100 disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed - 1)}
          disabled={textSpeed === minSpeed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={5}
            stroke="currentColor"
            className="size-6 h-3 w-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed + 1)}
          disabled={textSpeed === maxSpeed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={5}
            stroke="currentColor"
            className="size-6 h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center text-sm">
        <p>
          <span className="font-semibold">{textSpeed.toString().padStart(2, '0')}</span>{' '}
          {t('TextSpeed')}
        </p>
      </div>
    </div>
  )
}
