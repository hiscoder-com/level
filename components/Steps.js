import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import UpdateField from './UpdateField'

import Down from 'public/arrow-down.svg'

function Steps({ customSteps = [], updateSteps }) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])

  const fields = [
    { title: t('common:Title'), name: 'title', textarea: false },
    { title: t('common:Description'), name: 'description', textarea: true },
    { title: t('common:Intro'), name: 'intro', textarea: true },
  ]
  return (
    <>
      {customSteps?.map((step, index) => (
        <Disclosure key={index}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between gap-2 py-2 px-4 bg-blue-150 rounded-md">
                <span>{step.title}</span>
                <Down
                  className={`w-5 h-5 transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  } `}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="p-4 space-y-7 bg-blue-150 rounded-md">
                {fields.map((field) => (
                  <div
                    className="flex flex-col md:flex-row items-center gap-2 w-full"
                    key={field.name}
                  >
                    <span className="w-auto md:w-1/6 font-bold">{field.title}</span>
                    <div className="w-5/6">
                      <UpdateField
                        value={step[field.name]}
                        index={index}
                        textarea={field.textarea}
                        fieldName={field.name}
                        updateValue={updateSteps}
                        specificClassName={'!bg-blue-150'}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row items-center w-full gap-2">
                  <div className="w-auto md:w-1/6 font-bold">{t('Tools')}</div>
                  <div className="flex flex-wrap justify-start gap-2 w-auto md:w-5/6">
                    {step?.config?.map((config, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap gap-2 pr-2 border-r border-slate-900 last:border-r-0"
                      >
                        {config.tools.map((tool) => (
                          <div
                            key={tool.name}
                            className="btn-primary p-2 rounded-md !cursor-auto hover:bg-transparent hover:border-slate-600"
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
                  <div className="btn-primary p-2 rounded-md !cursor-auto hover:bg-transparent hover:border-slate-600">
                    {step?.count_of_users}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="w-auto md:w-1/6 font-bold">
                    {t('project-edit:ExecutionTime')}
                  </span>
                  <div className="btn-primary p-2 rounded-md !cursor-auto hover:bg-transparent hover:border-slate-600">
                    {step.time}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </>
  )
}

export default Steps