import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import { useRecoilValue } from 'recoil'

import Tool from 'components/Panel/Tool'

import { inactiveState } from './Panel/state/atoms'

const sizes = {
  '1': 'lg:w-1/6',
  '2': 'lg:w-2/6',
  '3': 'lg:w-3/6',
  '4': 'lg:w-4/6',
  '5': 'lg:w-5/6',
  '6': 'lg:w-full',
}

const icons = {
  translate: '✏️',
  commandTranslate: '✏️',
  draftTranslate: '👓',
  teamNotes: '📌',
  personalNotes: '✍️',
  audio: '🎧',
  dictionary: '📙',
}
function Workspace({ stepConfig, reference }) {
  const inactive = useRecoilValue(inactiveState)
  return (
    <div className="layout-step">
      {stepConfig.config.map((el, index) => {
        return (
          <div
            key={index}
            className={`layout-step-col ${index === 0 && inactive ? 'inactive' : ''} ${
              sizes[el.size]
            }`}
          >
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
  const { t } = useTranslation('common')
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <Tab.Group>
      <Tab.List className="space-x-3 text-xs px-3 -mb-2 lg:-mb-7 flex overflow-auto">
        {tools?.map((tool) => (
          <Tab
            key={tool.name}
            className={({ selected }) =>
              classNames(
                'btn text-xs p-1 md:p-2 md:text-sm lg:text-base text-ellipsis overflow-hidden whitespace-nowrap',
                selected ? 'btn-cyan' : 'btn-white'
              )
            }
          >
            {[
              'translate',
              'commandTranslate',
              'draftTranslate',
              'teamNotes',
              'personalNotes',
              'audio',
              'dictionary',
            ].includes(tool.name) ? (
              <span title={t(tool.name)}>
                {icons[tool.name]}
                <span className="hidden sm:inline">{t(tool.name)}</span>
              </span>
            ) : (
              tool.name
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tools.map((tool, index) => {
          return (
            <Tab.Panel key={index}>
              <div className="flex flex-col bg-white rounded-lg h-full">
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
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
