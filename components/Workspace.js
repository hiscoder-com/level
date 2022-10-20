import { Tab } from '@headlessui/react'

import { useTranslation } from 'next-i18next'

import Tool from './Panel/Tool'

const sizes = {
  '1': 'lg:w-1/6',
  '2': 'lg:w-2/6',
  '3': 'lg:w-3/6',
  '4': 'lg:w-4/6',
  '5': 'lg:w-5/6',
  '6': 'lg:w-full',
}

function Workspace({ stepConfig, reference }) {
  return (
    <div className="layout-step">
      {stepConfig.config.map((el, index) => {
        return (
          <div key={index} className={`layout-step-col ${sizes[el.size]}`}>
            <Panel
              tools={el.tools}
              resources={stepConfig.resources}
              reference={reference}
              wholeChapter={stepConfig.whole_chapter}
            />
          </div>
        )
      })}
    </div>
  )
}

export default Workspace

function Panel({ tools, resources, reference, wholeChapter }) {
  const { t } = useTranslation()
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <Tab.Group>
      <Tab.List className="space-x-3 text-xs">
        {tools?.map((tool) => (
          <Tab
            key={tool.name}
            className={({ selected }) =>
              classNames(
                'btn text-xs md:text-sm lg:text-base',
                selected ? 'btn-cyan' : 'btn-white'
              )
            }
          >
            {tool.name}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tools.map((tool, index) => {
          return (
            <Tab.Panel key={index}>
              <div className="flex flex-col h-80 md:h-96 bg-white rounded-lg lg:h-full">
                <div className="h5 pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg">
                  {t('Chapter')} {reference.chapter}
                </div>
                <div className="h5 p-4 h-screen overflow-x-hidden overflow-y-scroll">
                  <Tool
                    config={{
                      reference,
                      wholeChapter,
                      config: tool.config,
                      resource: resources[tool.name]
                        ? resources[tool.name]
                        : { manifest: { dublin_core: { subject: tool.name } } },
                    }}
                  />
                </div>
              </div>
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
