import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import SwitchLocalization from './SwitchLocalization'
import { useRouter } from 'next/router'

function ConfirmPasswordRecovery() {
  const { t } = useTranslation('users')
  const { query } = useRouter()
  const [confirmationUrl, setConfirmationUrl] = useState('')

  useEffect(() => {
    if (query.confirmation_url) {
      setConfirmationUrl(query.confirmation_url)
    }
  }, [query])

  return (
    <div className="flex flex-col p-5 lg:py-10 xl:px-8">
      <div className="flex justify-between items-center mb-6">
        <Link className="text-th-primary-100" href={confirmationUrl}>
          {t('ClickThisToPasswordRecovery')}
        </Link>
        <SwitchLocalization />
      </div>
    </div>
  )
}

export default ConfirmPasswordRecovery
