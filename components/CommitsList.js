import { useEffect, useMemo, useState } from 'react'

import { useMethod } from 'utils/hooks'

function CommitsList({ methodId, setResourcesUrl, resourcesUrl }) {
  const [customResources, setCustomResources] = useState({})
  const [methods] = useMethod()
  useEffect(() => {
    if (methods && methodId) {
      const selectedMethod = methods.find(
        (el) => el.id.toString() === methodId.toString()
      )
      if (selectedMethod) {
        setCustomResources(selectedMethod.resources)
      }
    }
  }, [methodId, methods])
  const resources = useMemo(() => {
    const listOfResources = []
    for (const resource in customResources) {
      if (Object.hasOwnProperty.call(customResources, resource)) {
        const isPrimary = customResources[resource]
        listOfResources.push(
          <div
            className="flex flex-col items-start gap-4 text-sm md:flex-row md:items-center md:gap-7 md:text-base"
            key={resource}
          >
            <div className={`w-auto sm:w-1/6 md:w-1/6 ${isPrimary ? 'font-bold' : ''}`}>
              {resource}:
            </div>
            <input
              className="input-primary"
              value={resourcesUrl?.[resource] ?? ''}
              onChange={(e) =>
                setResourcesUrl((prev) => ({ ...prev, [resource]: e.target.value }))
              }
            />
          </div>
        )
      }
    }
    return listOfResources.sort((a, b) => a.key.localeCompare(b.key))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customResources, resourcesUrl])

  return <div className="flex flex-col gap-2 text-lg">{resources}</div>
}

export default CommitsList
