import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import Translators from 'components/Translators'
import ProgressBar from 'components/ProgressBar'

import { stepConfigState } from './Panel/state/atoms'

export default function Footer({
  textCheckbox,
  textButton,
  href,
  handleClick,
  loading = false,
}) {
  const [isStepPage, setIsStepPage] = useState(false)
  const router = useRouter()
  const stepConfig = useRecoilValue(stepConfigState)
  const [checked, setChecked] = useState(false)

  const { step } = router?.query
  const { t } = useTranslation('common')
  useEffect(() => {
    setChecked(false)
  }, [step])

  useEffect(() => {
    setIsStepPage(router.pathname === '/translate/[project]/[book]/[chapter]/[step]')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  return (
    <div className="flex flex-col justify-between items-center px-4 mx-auto w-full max-w-7xl bg-blue-150 md:flex-row-reverse lg:px-0">
      <div className="relative flex items-center h-12 md:h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 items-center h5">
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
            <button
              onClick={handleClick}
              className="btn-cyan w-28 text-center"
              disabled={!checked || loading}
            >
              {loading ? (
                <svg
                  className="animate-spin my-0 mx-auto h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                textButton
              )}
            </button>
          )}
        </div>
      </div>
      {isStepPage && (
        <>
          <div className="pb-3 md:pb-0">
            <ProgressBar
              amountSteps={stepConfig.last_step}
              currentStep={stepConfig.current_step}
            />
          </div>
          <div className="flex gap-2.5 h5 items-center pb-3 md:pb-0">
            <div>{t('Fulfilled')}:</div>
            <Translators projectCode={stepConfig.project_code} size="34px" />
          </div>
        </>
      )}
    </div>
  )
}
