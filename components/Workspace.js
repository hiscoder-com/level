import { Tab } from '@headlessui/react'

import { useTranslation } from 'next-i18next'

import Tool from './Panel/Tool'

const sizes = { '1': 'lg:w-1/6', '2': 'lg:w-2/6', '3': 'lg:w-3/6', '4': 'lg:w-4/6' }

function Workspace({ config, reference }) {
  const { t } = useTranslation()
  return (
    <div className="layout-step">
      {config.map((el, index) => {
        return (
          <div key={index} className={`layout-step-col ${sizes[el.size]}`}>
            <Panel tools={el.tools} reference={reference} />
          </div>
        )
      })}
    </div>
  )
}

export default Workspace

function Panel({ tools, reference }) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <Tab.Group>
      <Tab.List className="space-x-3 text-xs">
        {tools?.map((tool) => (
          <Tab
            key={tool?.id}
            className={({ selected }) =>
              classNames(
                'btn text-xs md:text-sm lg:text-base',
                selected ? 'btn-cyan' : 'btn-white'
              )
            }
          >
            {tool?.config?.title
              ? tool?.config?.title
                  .split(' ')
                  .reduce((prevVal, curWord) => prevVal + (curWord ? curWord[0] : ''), '')
                  .toUpperCase()
              : tool?.config?.subject}
          </Tab>
        ))}
      </Tab.List>
      <div className="layout-step-col-card">
        <div className="layout-step-col-card-title">Chapter {reference.chapter}</div>
        <div className="h5 p-4 h-screen overflow-scroll">
          <Tab.Panels>
            {tools.map((tool) => {
              return (
                <Tab.Panel key={tool?.id}>
                  <Tool config={{ reference: reference, resource: tool?.config }} />
                </Tab.Panel>
              )
            })}
          </Tab.Panels>
        </div>
      </div>
    </Tab.Group>
  )
}
