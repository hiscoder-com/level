import { useState } from 'react'

import { useTranslation } from 'next-i18next'

import Recorder from '../../Recorder'

export default function Audio() {
  const [isRetellPartner, setIsRetellPartner] = useState(true)

  return (
    <>
      {isRetellPartner ? (
        <RetellPartner setIsRetellPartner={setIsRetellPartner} />
      ) : (
        <RetellYourself />
      )}
    </>
  )
}

function RetellPartner({ setIsRetellPartner }) {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex flex-col items-center gap-5 py-24 lg:py-56">
      <button className="btn-cyan">{t('RetellPartner')}</button>
      <p>{t('Title')}</p>

      <button
        onClick={() => {
          setIsRetellPartner(false)
        }}
        className="btn-cyan"
      >
        {t('RetellYourself')}
      </button>
    </div>
  )
}

function RetellYourself() {
  const { t } = useTranslation(['audio'])
  return (
    <div className="flex justify-center flex-wrap mt-8">
      <div className="w-full pb-4 px-2 mb-4 border-b-4">
        <p className="mb-4 px-4">{t('OriginalRecording')}</p>
        <Recorder />
      </div>
      <div className="w-full pb-4 px-2 mb-4 border-b-4">
        <p className="mb-4 px-4">{t('TargetRecording')}</p>
        <Recorder />
      </div>
    </div>
  )
}
