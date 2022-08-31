import { Tab } from '@headlessui/react'
import Tool from './Tools/Tool'

function Resources({ config }) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <Tab.Group>
      <Tab.List className="space-x-3 text-xs">
        {config?.resources.map((resource) => (
          <Tab
            key={resource.repo}
            className={({ selected }) =>
              classNames(
                'tab  text-xs md:text-sm lg:text-base ',
                selected ? 'active' : ''
              )
            }
          >
            {resource.repo}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {config?.resources.map((resource) => {
          return (
            <Tab.Panel key={resource.repo}>
              <Tool config={{ reference: config.reference, resource }} />
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}

export default Resources
