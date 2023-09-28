import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useRecoilValue } from 'recoil'

import ButtonSave from './ButtonSave'

import Translators from 'components/Translators'
import ProgressBar from 'components/ProgressBar'
import CheckboxShevron from 'public/checkbox-shevron.svg'

import { stepConfigState } from './state/atoms'
export default function Footer({
  loading = false,
  textCheckbox,
  handleClick,
  textButton,
  href,
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
    <div className="flex flex-col justify-between items-center px-4 mx-auto w-full max-w-7xl bg-th-primary-background md:flex-row-reverse lg:px-0">
      <div className="relative flex items-center h-12 md:h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 flex items-center">
            <label
              className="relative flex justify-center items-center p-3 cursor-pointer rounded-full"
              htmlFor="done"
              data-ripple-dark="true"
            >
              <input
                id="done"
                type="checkbox"
                className="w-6 h-6 shadow-sm before:content[''] peer relative cursor-pointer appearance-none rounded-md border border-th-secondary bg-th-secondary-background checked:bg-th-secondary transition-all before:absolute before:top-1/2 before:left-1/2 before:block before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-full before:opacity-0 before:transition-opacity hover:before:opacity-10"
                checked={checked}
                onChange={() => setChecked((prev) => !prev)}
              />
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2  opacity-0 transition-opacity peer-checked:opacity-100 stroke-th-secondary-icons fill-th-secondary-icons">
                <CheckboxShevron />
              </div>
            </label>
            <span className="ml-2">{textCheckbox}</span>
          </div>
          {href ? (
            <Link href={href} legacyBehavior>
              <button className="btn-cyan !px-6" disabled={!checked}>
                {textButton}
              </button>
            </Link>
          ) : (
            <ButtonSave
              onClick={handleClick}
              isSaving={loading}
              disabled={!checked}
              className
            >
              {textButton}
            </ButtonSave>
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
            <div>{t('Fulfilled')}:</div>
            <Translators
              projectCode={stepConfig.project_code}
              size="34px"
              clickable={true}
            />
          </div>
        </>
      )}
    </div>
  )
}
