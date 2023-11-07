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
export default function Footer({
  loading = false,
  textCheckbox,
  handleClick,
  textButton,
  href,
  className = { button: 'relative btn-quaternary w-28 text-center' },
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
    <div className="flex flex-col justify-between items-center px-4 mx-auto w-full max-w-7xl bg-th-background-primary md:flex-row-reverse lg:px-0">
      <div className="relative flex items-center h-12 md:h-16">
        <div className="flex flex-row items-center space-x-6">
          <CheckBox
            onChange={() => setChecked((prev) => !prev)}
            checked={checked}
            className={{
              accent:
                'bg-th-background-secondary checked:bg-th-secondary checked:border-th-secondary checked:before:bg-th-secondary border-th-secondary',
              cursor:
                'fill-th-background-secondary text-th-background-secondary stroke-th-background-secondary',
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
      </div>
      {isStepPage && (
        <>
          <div className="pb-3 md:pb-0">
            <ProgressBar
              amountSteps={stepConfig.last_step}
              currentStep={stepConfig.current_step}
            />
          </div>
          <div className="flex gap-2.5 items-center pb-3 md:pb-0">
            <div>{t('Participants')}:</div>
            <Translators
              projectCode={stepConfig.project_code}
              size="34px"
              clickable={true}
              className="mx-0.5"
              showModerator
            />
          </div>
        </>
      )}
    </div>
  )
}
