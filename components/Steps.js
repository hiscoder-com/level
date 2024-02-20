import { useRouter } from 'next/router'

import { Disclosure, Switch } from '@headlessui/react'
import { useTranslation } from 'next-i18next'
import axios from 'axios'

import UpdateField from './UpdateField'

import Down from 'public/arrow-down.svg'

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
                className={`flex justify-between items-center gap-2 py-3 px-4 w-full text-start  border-x border-t border-th-secondary-300
                ${className} 
                ${open ? 'rounded-t-md' : 'rounded-md border-b'}`}
              >
                <span>{step.title}</span>
                <Down
                  className={`w-5 h-5 transition-transform duration-200 stroke-th-text-primary ${
                    open ? 'rotate-180' : 'rotate-0'
                  } `}
                />
              </Disclosure.Button>
              <Disclosure.Panel
                className={`p-4 space-y-7 border-x border-b border-th-secondary-300 rounded-b-md text-sm md:text-base ${className}`}
              >
                {fields.map((field) => (
                  <div
                    className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full"
                    key={field.name}
                  >
                    <span className="w-auto md:w-1/6 font-bold">{field.title}</span>
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
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
                  <div className="w-auto md:w-1/6 font-bold">
                    {t('project-edit:Tools')}
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 w-auto md:w-5/6">
                    {step?.config?.map((config, idx_config) => (
                      <div
                        key={idx_config}
                        className="flex flex-wrap gap-2 pr-2 border-r last:border-r-0"
                      >
                        {config.tools.map((tool) => (
                          <div
                            key={tool.name}
                            className="btn-base bg-th-secondary-200 hover:bg-th-secondary-200 pointer-events-none "
                          >
                            {t('common:' + tool.name)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="w-auto md:w-1/6 font-bold">
                    {t('project-edit:TranslatorsCount')}
                  </span>
                  <div className="btn-base bg-th-secondary-200 hover:bg-th-secondary-200 pointer-events-none">
                    {step?.count_of_users}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="w-auto md:w-1/6 font-bold">
                    {t('project-edit:ExecutionTime')}
                  </span>
                  <div className="btn-base bg-th-secondary-200 hover:bg-th-secondary-200 pointer-events-none">
                    {step.time}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  {isShowAwaitingTeam && (
                    <>
                      <span className="w-auto md:w-1/6 font-bold">
                        {t('project-edit:AwaitingTeam')}
                      </span>
                      <Switch
                        checked={step.is_awaiting_team}
                        onChange={() =>
                          handleSwitchAwaitingTeam({ index: idx_step, step })
                        }
                        className={`${
                          step.is_awaiting_team
                            ? 'bg-th-primary-100 border-th-primary-100'
                            : 'bg-th-secondary-200 border-th-secondary-300'
                        } relative inline-flex h-6 w-11 items-center border rounded-full`}
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
