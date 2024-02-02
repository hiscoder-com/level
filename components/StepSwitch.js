import { useState } from 'react'

import { Popover } from '@headlessui/react'

import { useTranslation } from 'react-i18next'

import useSupabaseClient from 'utils/supabaseClient'

import Down from 'public/arrow-down.svg'

function StepSwitch({ stepProps, handleGetSteps }) {
  const supabase = useSupabaseClient()
  const { t } = useTranslation(['common'])
  const [activeSteps, setActiveSteps] = useState({})
  const goToStep = async (newStep, stepProps) => {
    await supabase
      .rpc('go_to_specific_step', {
        new_step: newStep,
        login: stepProps.login,
        project: stepProps.project,
        chapter: stepProps.chapter,
        book: stepProps.book,
        current_step: stepProps.step,
      })
      .then((res) => {
        if (res.data) {
          handleGetSteps(stepProps.book, stepProps.chapter)
          getActiveSteps(stepProps)
        }
      })
      .catch((err) => console.log(err))
  }
  const getActiveSteps = async (step) => {
    supabase
      .rpc('get_max_step', {
        project_code: step.project,
        translator_id: step.translator_id,
        chapter_id: step.chapter_id,
      })
      .then((res) => {
        setActiveSteps(res.data)
      })
      .catch((err) => console.log({ err }))
  }
  return (
    <Popover as="div" className="relative">
      {({ open }) => {
        return (
          <>
            <Popover.Button
              className="flex gap-3 py-3 px-2"
              onClick={(e) => {
                e.stopPropagation()
                !open && getActiveSteps(stepProps)
              }}
            >
              <span>{t('Step')}</span>
              <div className="flex items-center gap-1">
                <span>{stepProps.step}</span>
                <Down className="w-5 h-5" />
              </div>
            </Popover.Button>
            <Popover.Panel
              className={`absolute transform mt-1 py-2 bg-th-secondary-10 text-th-text-primary rounded-lg flex items-center justify-center shadow-lg z-50 w-fit`}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <div className="flex flex-wrap justify-center items-center gap-2">
                {activeSteps?.count_steps
                  ? [...Array(activeSteps?.count_steps).keys()].map((el) => (
                      <button
                        key={el}
                        disabled={
                          activeSteps.max_step < el + 1 || stepProps.step === el + 1
                        }
                        className={`py-1 px-3  rounded-md flex flex-col justify-center ${
                          activeSteps.max_step < el + 1 || stepProps.step === el + 1
                            ? 'bg-th-secondary-100'
                            : 'bg-th-secondary-400 hover:opacity-70 text-th-secondary-10'
                        }`}
                        onClick={() => goToStep(el + 1, stepProps)}
                      >
                        {el + 1}
                      </button>
                    ))
                  : [...Array(8).keys()].map((el) => (
                      <div
                        key={el}
                        className="py-1 px-3 text-th-text-primary bg-th-secondary-100 rounded-md flex flex-col justify-center"
                      >
                        {el + 1}
                      </div>
                    ))}
              </div>
            </Popover.Panel>
          </>
        )
      }}
    </Popover>
  )
}
export default StepSwitch
