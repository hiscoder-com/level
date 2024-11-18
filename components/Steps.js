import { useRouter } from 'next/router'

import { Disclosure, Switch } from '@headlessui/react'
import axios from 'axios'
import { useTranslation } from 'next-i18next'

import UpdateField from './UpdateField'

import Down from 'public/icons/arrow-down.svg'

function Steps({
  updateSteps,
  customSteps = [],
  className = 'bg-th-secondary-10',
  isShowAwaitingTeam = false,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const {
    query: { code },
  } = useRouter()

  const fields = [
    { title: t('common:Title'), name: 'title', textarea: false },
    { title: t('common:Subtitle'), name: 'subtitle', textarea: false },
    { title: t('common:Description'), name: 'description', textarea: true },
    { title: t('common:IntroStep'), name: 'intro', textarea: true },
  ]

  const handleSwitchAwaitingTeam = ({ index, step }) => {
    const isAwaitingTeam = !step.is_awaiting_team
    updateSteps({
      index,
      fieldName: 'is_awaiting_team',
      value: isAwaitingTeam,
    })
    axios
      .put(`/api/projects/${code}/steps/${step.id}`, {
        step: { is_awaiting_team: isAwaitingTeam },
      })
      .then()
      .catch(console.log)
  }
  return (
    <>
      {customSteps?.map((step, idx_step) => (
        <Disclosure key={idx_step}>
          {({ open }) => (
            <div>
              <Disclosure.Button
                className={`flex w-full items-center justify-between gap-2 border-x border-t border-th-secondary-300 px-4 py-3 text-start ${className} ${open ? 'rounded-t-md' : 'rounded-md border-b'}`}
              >
                <span>{step.title}</span>
                <Down
                  className={`h-5 w-5 stroke-th-text-primary transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  } `}
                />
              </Disclosure.Button>
              <Disclosure.Panel
                className={`space-y-7 rounded-b-md border-x border-b border-th-secondary-300 p-4 text-sm md:text-base ${className}`}
              >
                {fields.map((field) => (
                  <div
                    className="flex w-full flex-col items-start gap-2 md:flex-row md:items-center"
                    key={field.name}
                  >
                    <span className="w-auto font-bold md:w-1/6">{field.title}</span>
                    <div className="w-full md:w-5/6">
                      <UpdateField
                        value={step[field.name]}
                        index={idx_step}
                        textarea={field.textarea}
                        fieldName={field.name}
                        updateValue={updateSteps}
                        className={`input-primary ${className}`}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex w-full flex-col items-start gap-2 md:flex-row md:items-center">
                  <div className="w-auto font-bold md:w-1/6">
                    {t('project-edit:Tools')}
                  </div>
                  <div className="flex w-auto flex-wrap justify-start gap-2 md:w-5/6">
                    {step?.config?.map((config, idx_config) => (
                      <div
                        key={idx_config}
                        className="flex flex-wrap gap-2 border-r pr-2 last:border-r-0"
                      >
                        {config.tools.map((tool) => (
                          <div
                            key={tool.name}
                            className="btn-base pointer-events-none bg-th-secondary-200 hover:bg-th-secondary-200"
                          >
                            {t('common:' + tool.name)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  <span className="w-auto font-bold md:w-1/6">
                    {t('project-edit:TranslatorsCount')}
                  </span>
                  <div className="btn-base pointer-events-none bg-th-secondary-200 hover:bg-th-secondary-200">
                    {step?.count_of_users}
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  <span className="w-auto font-bold md:w-1/6">
                    {t('project-edit:ExecutionTime')}
                  </span>
                  <div className="btn-base pointer-events-none bg-th-secondary-200 hover:bg-th-secondary-200">
                    {step.time}
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  {isShowAwaitingTeam && (
                    <>
                      <span className="w-auto font-bold md:w-1/6">
                        {t('project-edit:AwaitingTeam')}
                      </span>
                      <Switch
                        checked={step.is_awaiting_team}
                        onChange={() =>
                          handleSwitchAwaitingTeam({ index: idx_step, step })
                        }
                        className={`${
                          step.is_awaiting_team
                            ? 'border-th-primary-100 bg-th-primary-100'
                            : 'border-th-secondary-300 bg-th-secondary-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full border`}
                      >
                        <span
                          className={`${
                            step.is_awaiting_team ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-th-secondary-10 transition`}
                        />
                      </Switch>
                    </>
                  )}
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </>
  )
}

export default Steps
