import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import Translators from 'components/Translators'
import ProgressBar from 'components/ProgressBar'
import ButtonLoading from 'components/ButtonLoading'
import CheckBox from 'components/CheckBox'

import { stepConfigState } from './state/atoms'
import Loading from 'public/progress.svg'

export default function Footer({
  loading = false,
  textCheckbox,
  handleClick,
  textButton,
  href,
  className = { button: 'relative btn-quaternary w-28 text-center' },
  isAwaitTeam = false,
}) {
  const [isStepPage, setIsStepPage] = useState(false)
  const [checked, setChecked] = useState(false)

  const stepConfig = useRecoilValue(stepConfigState)
  const { t } = useTranslation('common')
  const router = useRouter()
  const { step } = router?.query

  useEffect(() => {
    setChecked(false)
  }, [step])

  useEffect(() => {
    setIsStepPage(router.pathname === '/translate/[project]/[book]/[chapter]/[step]')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])
  return (
    <div className="relative flex flex-col justify-between items-center py-4 md:py-0 mx-auto md:w-full max-w-7xl bg-th-secondary-100 md:flex-row lg:px-4 xl:px-0">
      {isStepPage && (
        <>
          <div className="hidden lg:block absolute mx-auto left-0 right-0 pb-3 md:pb-0 translate-y-1/3">
            <ProgressBar
              amountSteps={stepConfig.last_step}
              currentStep={stepConfig.current_step}
            />
          </div>
          <div className="flex gap-2.5 items-center justify-between pb-5 md:pb-0 w-full md:w-auto lg:order-first">
            <div>{t('Participants')}:</div>
            <Translators
              projectCode={stepConfig.project_code}
              size="34px"
              clickable={true}
              className="mx-0.5"
              showModerator
              isStep={true}
              activeTranslators={stepConfig.activeTranslators}
            />
          </div>
        </>
      )}
      <div
        className={`relative flex items-center h-12 md:h-14 w-full md:w-auto ${
          !isStepPage ? 'ml-auto' : ''
        }`}
      >
        {!isAwaitTeam ? (
          <div className="flex flex-row justify-between w-full items-center space-x-6">
            <CheckBox
              onChange={() => setChecked((prev) => !prev)}
              checked={checked}
              className={{
                accent:
                  'bg-th-secondary-10 checked:bg-th-secondary-400 checked:border-th-secondary-400 checked:before:bg-th-secondary-400 border-th-secondary',
                cursor:
                  'fill-th-secondary-10 text-th-secondary-10 stroke-th-secondary-10',
              }}
              label={textCheckbox}
            />
            {href ? (
              <Link href={href} legacyBehavior>
                <button className={className.button} disabled={!checked}>
                  {textButton}
                </button>
              </Link>
            ) : (
              <ButtonLoading
                onClick={handleClick}
                className={className.button}
                disabled={!checked}
                isLoading={loading}
              >
                {textButton}
              </ButtonLoading>
            )}
          </div>
        ) : (
          <Loading className="progress-custom-colors w-7 animate-spin stroke-th-primary-100" />
        )}
      </div>
    </div>
  )
}
