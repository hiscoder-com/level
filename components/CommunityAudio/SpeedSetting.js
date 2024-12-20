import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Minus from 'public/icons/audioMinus.svg'
import Plus from 'public/icons/audioPlus.svg'

export default function SpeedSetting({ textSpeed, setTextSpeed }) {
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useTranslation(['common'])

  const minSpeed = 1
  const maxSpeed = 15

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !textSpeed || !setTextSpeed) return null

  return (
    <div className="flex items-center gap-2 space-x-2">
      <div className="grid h-10 w-20 grid-cols-2 overflow-hidden rounded-full border border-th-primary-100">
        <button
          className="flex items-center justify-center border border-e-th-primary-100 disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed - 1)}
          disabled={textSpeed === minSpeed}
        >
          <Minus />
        </button>
        <button
          className="flex items-center justify-center disabled:opacity-70"
          onClick={() => setTextSpeed(textSpeed + 1)}
          disabled={textSpeed === maxSpeed}
        >
          <Plus />
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
