import { Tab } from '@headlessui/react'
import Tool from './Tools/Tool'

function Resources({ tools, reference }) {
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
                'tab  text-xs md:text-sm lg:text-base btn-white ',
                selected ? 'active' : ''
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
        <div className="h5 p-4  h-screen overflow-scroll">
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

export default Resources
