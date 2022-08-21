import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import Fulfilled from '../public/fulfilled.svg'
import ProgressBar from './ProgressBar'

export default function Footer({ textCheckbox, textButton, href, handleClick }) {
  const [isStepPage, setIsStepPage] = useState(false)
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const { step } = router?.query
  const { t } = useTranslation('common')
  useEffect(() => {
    setChecked(false)
  }, [step])

  useEffect(() => {
    setIsStepPage(router.pathname === '/steps/[step]')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  return (
    <div className="layout-footer">
      <div className="relative flex items-center h-12 md:h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 items-center h4">
            <input
              className="cursor-pointer"
              id="cb"
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((prev) => !prev)}
            />
            <label className="cursor-pointer" htmlFor="cb">
              {textCheckbox}
            </label>
          </div>
          {href ? (
            <Link href={href}>
              <button className="btn-cyan w-28" disabled={!checked}>
                {textButton}
              </button>
            </Link>
          ) : (
            <button onClick={handleClick} className="btn-cyan w-28" disabled={!checked}>
              {textButton}
            </button>
          )}
        </div>
      </div>
      {isStepPage && (
        <>
          <div className="pb-3 md:pb-0">
            <ProgressBar amountSteps={7} currentStep={step} />
          </div>
          <div className="flex gap-2.5 h5 items-center pb-3 md:pb-0">
            <div>{t('Fulfilled')}:</div>
            <Fulfilled />
          </div>
        </>
      )}
    </div>
  )
}
