import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

export default function FontSizeSetting({ fontSize, setFontSize }) {
  const [isMounted, setIsMounted] = useState(false)

  const { t } = useTranslation(['common'])

  const minSize = 12
  const maxSize = 48

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !fontSize || !setFontSize) return null

  return (
    <div className="flex items-center gap-2 space-x-2">
      <div className="grid h-10 w-20 grid-cols-2 overflow-hidden rounded-full border border-th-primary-100 font-bold">
        <button
          className="flex items-center justify-center border border-e-th-primary-100 text-xs disabled:opacity-70"
          onClick={() => setFontSize(fontSize - 1)}
          disabled={fontSize === minSize}
        >
          A
        </button>
        <button
          className="flex items-center justify-center disabled:opacity-70"
          onClick={() => setFontSize(fontSize + 1)}
          disabled={fontSize === maxSize}
        >
          A
        </button>
      </div>
      <div className="flex items-center text-sm">
        <p>
          <span className="font-semibold">{fontSize}</span> {t('FontSize')}
        </p>
      </div>
    </div>
  )
}
