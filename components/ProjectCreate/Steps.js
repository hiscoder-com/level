import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'next-i18next'

import Down from 'public/arrow-down.svg'
import UpdateField from './UpdateField'

function Steps({ customSteps = [], updateCollection, setCustomSteps }) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])

  const fields = [
    { name: t('common:Title'), type: 'title', textarea: false },
    { name: t('common:Description'), type: 'description', textarea: true },
    { name: t('common:Intro'), type: 'intro', textarea: true },
  ]
  return (
    <>
      {customSteps?.map((step, index) => (
        <Disclosure key={index}>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between gap-2 py-2 px-4 bg-slate-200 rounded-md">
                <span>{step.title}</span>
                <Down
                  className={`w-5 h-5 transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  } `}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="space-y-7">
                {fields.map((field) => (
                  <div className="flex items-center gap-2 w-full" key={field.type}>
                    <span className="w-1/6">{field.name}</span>
                    <div className="w-5/6">
                      <UpdateField
                        value={step[field.type]}
                        updateCollection={updateCollection}
                        index={index}
                        type={field.type}
                        textarea={field.textarea}
                        collection={customSteps}
                        name="steps"
                        setter={setCustomSteps}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center w-full gap-2">
                  <div className="w-1/6">{t('Tools')}</div>
                  <div className="flex flex-wrap justify-start gap-2 w-5/6">
                    {step?.config?.map((config, index) => (
                      <div
                        key={index}
                        className="flex gap-2 pr-2 border-r border-slate-900 last:border-r-0"
                      >
                        {config.tools.map((tool) => (
                          <div
                            key={tool.name}
                            className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto"
                          >
                            {t('common:' + tool.name)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="w-1/6">{t('project-edit:TranslatorsCount')}</span>
                  <div className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto">
                    {step?.count_of_users}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <span className="w-1/6">{t('project-edit:ExecutionTime')}</span>
                  <div className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto">
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
