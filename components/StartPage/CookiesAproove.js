import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

function CookiesAproove() {
  const { t } = useTranslation(['start-page'])
  const [isShowCookiesModal, setIsShowCookiesModal] = useState(false)
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsShowCookiesModal(true)
    }
  }, [])
  const handleAcceptClick = () => {
    localStorage.setItem('cookieConsent', 'accept')
    setIsShowCookiesModal(false)
  }

  const handleDeclineClick = () => {
    localStorage.setItem('cookieConsent', 'decline')
    setIsShowCookiesModal(false)
  }
  return (
    <>
      {isShowCookiesModal && (
        <div className="max-w-sm bg-th-text-secondary-100 p-5 rounded-2xl shadow-2xl">
          <p className="text-base font-bold">{t('Cookies.Title')}</p>
          <p className="text-sm font-medium">
            {t('Cookies.Text')}{' '}
            <a href="/privacy-policy" target="_blank" className="text-th-primary-100">
              {' '}
              {t('PrivacyPolicy')}
            </a>
            .
          </p>
          <div className="flex justify-center gap-7">
            <button
              className="mt-5 btn-quaternary"
              label="Accept"
              onClick={handleAcceptClick}
            >
              {t('Iagree')}
            </button>
            <button
              className="mt-5 btn-secondary border"
              label="Accept"
              onClick={handleDeclineClick}
            >
              {t('Idecline')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default CookiesAproove
