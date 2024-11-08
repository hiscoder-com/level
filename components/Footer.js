import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import ButtonLoading from 'components/ButtonLoading'
import CheckBox from 'components/CheckBox'
import ProgressBar from 'components/ProgressBar'
import Translators from 'components/Translators'

import { stepConfigState } from './state/atoms'

import Loading from 'public/icons/progress.svg'

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
    <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between bg-th-secondary-100 py-4 md:w-full md:flex-row md:py-0 lg:px-4 xl:px-0">
      {isStepPage && (
        <>
          <div className="absolute left-0 right-0 mx-auto hidden translate-y-1/3 pb-3 md:pb-0 lg:block">
            <ProgressBar
              amountSteps={stepConfig.last_step}
              currentStep={stepConfig.current_step}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-2.5 pb-5 md:w-auto md:pb-0 lg:order-first">
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
        className={`relative flex h-12 w-full items-center md:h-14 md:w-auto ${
          !isStepPage ? 'ml-auto' : ''
        }`}
      >
        {!isAwaitTeam ? (
          <div className="flex w-full flex-row items-center justify-between space-x-6">
            <CheckBox
              onChange={() => setChecked((prev) => !prev)}
              checked={checked}
              className={{
                accent:
                  'border-th-secondary bg-th-secondary-10 checked:border-th-secondary-400 checked:bg-th-secondary-400 checked:before:bg-th-secondary-400',
                cursor:
                  'fill-th-secondary-10 stroke-th-secondary-10 text-th-secondary-10',
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
